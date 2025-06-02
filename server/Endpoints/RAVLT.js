import express from "express";
import fs from "fs";
import RAVLTTrial from "../Models/RAVLTTrial.js";
import RAVLTResults from "../Models/RAVLTResults.js";
import pairwiseSimilarityCalculations from "../AnalysisAlgorithms/PairwiseSimilarityCalculations.js";
import { generateAlphanumericSequence } from "../helperfunctions.js";
import use from "@tensorflow-models/universal-sentence-encoder";

const router = express.Router();

// import '@tensorflow/tfjs-node';
// import * as use from '@tensorflow-models/universal-sentence-encoder';
// import natural from 'natural';
// const { JaroWinklerDistance } = natural;

// ======================================================
// UTILITY FUNCTIONS
// ======================================================
// Helper functions used by the endpoints

let useModel;
async function getUseModel() {
    if (!useModel) useModel = await use.load();
    return useModel;
}


// ======================================================
// TRIAL MANAGEMENT
// ======================================================
// The endpoints below handle the creation, retrieval, and updating of RAVLT trials
// This includes generating trial IDs, storing trial metadata, and managing trial status

/**
 * @route POST /ravlt/createTrial
 * @description Generate a unique trial ID and create a new RAVLT trial in the database
 * @access Public
 * @returns {Object} - JSON object containing the generated trial ID
 */
router.post("/createTrial", async (req, res) => {
    try {
        let unique = false;
        let trialID;

        while (!unique) {
            trialID = "RAVLT-" + generateAlphanumericSequence(10);
            const exists = await RAVLTTrial.findOne({ trialID: trialID });
            if (!exists) {
                unique = true;
            }
        }
        
        // Create a new trial with empty patientID, current date, and incomplete status
        let trial = new RAVLTTrial({
            trialID: trialID,
            patientID: "", // Empty patientID as requested
            date: new Date(), // Current date
            test: "RAVLT",
            status: "incomplete"
        });
        
        await trial.save();
        res.json({ trialID: trialID });
    } catch (error) {
        console.error("Error initiating RAVLT trial:", error);
        res.status(500).json({ error: "Failed to initiate RAVLT trial" });
    }
});


// ======================================================
// RESULT HANDLING
// ======================================================
// The endpoints below handle the processing, storage, and retrieval of RAVLT test results.
// This includes transcription of audio recordings, calculation of scores,
// and storage of results in the database.

/**
 * @route POST /ravlt/updateTranscriptionResults
 * @description Get the transcription files for a completed transcription job
 * @access Public
 * @param {string} req.body.trialID - ID of the trial
 * @returns {Object} - JSON containing the transcription files or error message
 */
router.post("/updateTranscriptionResults", async (req, res) => {
    try {
        // Get trialID from query params
        const trialID = req.body.trialID;

        // Validate trialID is provided
        if (!trialID) {
            return res
                .status(400)
                .json({ msg: "Trial ID is required" });
        }

        // Get transcriptionID from the database using trialID
        const trial = await RAVLTTrial.findOne({ trialID: trialID });
        if (trial.status !== "complete") {
            return res
                .status(400)
                .json({ msg: "Trial is not completed" });
        }
        if (!trial || !trial.transcriptionID) {
            return res
                .status(404)
                .json({ msg: "Transcription ID not found for this trial" });
        }
        const transcriptionID = trial.transcriptionID;
        // Directly access the files endpoint for the specific transcription ID
        const filesUrl = `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions/${transcriptionID}/files`;

        const filesResponse = await fetch(filesUrl, {
            method: "GET",
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY,
                "Content-Type": "application/json",
            },
        });

        // Handle potential errors
        if (!filesResponse.ok) {
            return res.status(filesResponse.status).json({
                msg: `Error retrieving transcription files: ${filesResponse.statusText}`,
            });
        }

        const filesData = await filesResponse.json();

        if (!filesData.values || filesData.values.length === 0) {
            return res
                .status(404)
                .json({ msg: "No transcription files found" });
        }

        // Get the actual transcription content
        const transcriptionResults = [];
        for (const file of filesData.values) {
            const fileResponse = await fetch(file.links.contentUrl);
            const fileContent = await fileResponse.json();
            transcriptionResults.push({
                filename: file.name,
                content: fileContent,
            });
        }

        // Aggregate word-level timestamps, phrases, and combined phrases
        const words = [];
        const phrases = [];
        const combinedPhrases = [];
        transcriptionResults.forEach(({ content, filename }) => {
            // extract file index (from '-X.wav.json')
            const match = filename.match(/-(\d+)\.wav\.json$/);
            const fileIndex = match ? Number(match[1]) : null;
            (content.combinedRecognizedPhrases || []).forEach((p) =>
                combinedPhrases.push(p.display)
            );
            (content.recognizedPhrases || []).forEach((rp) => {
                const top = rp.nBest && rp.nBest[0];
                if (top) {
                    phrases.push(top.display);
                    (top.words || []).forEach((w) =>
                        words.push({
                            word: w.word,
                            time: w.offsetMilliseconds,
                            duration: w.durationMilliseconds,
                            confidence: w.confidence,
                            fileIndex,
                        })
                    );
                }
            });
        });
        if (req.query.patientID && req.query.trialID && req.query.test) {
            switch (req.query.test) {
                case "RAVLT":
                    const transcribedWords = words;
                    RAVLTResults.findOneAndUpdate(
                        {
                            patientID: req.query.patientID,
                            trialID: req.query.trialID,
                        },
                        { transcribedWords: transcribedWords },
                        { new: true }
                    )
                        .then((updatedTrial) => {
                            console.log("Updated trial:", updatedTrial);
                        })
                        .catch((error) => {
                            console.error("Error updating trial:", error);
                            res.status(500).json({
                                msg: "Error updating trial",
                            });
                        });
            }
        }

        res.json({ words, phrases, combinedPhrases });
    } catch (error) {
        console.error("Error retrieving transcription files:", error);
        res.status(500).json({ msg: "Error retrieving transcription files" });
    }
});

/**
 * @route POST /ravlt/calculateResults
 * @description Calculate RAVLT results for a given trial
 * @param {string} trialID - The ID of the trial
 * @returns {Object} - The calculated RAVLT results
 */
router.post("/calculateResults", async (req, res) => {
    if (!req.body.trialID) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const { trialID } = req.body;
    const results = await RAVLTResults.findOne({
        trialID: trialID,
    });
    if (!results || !results.transcribedWords) {
        return res.status(400).send({ msg: "Missing transcribed words" });
    }
    const transcribedWords = results.transcribedWords.map((w) => w.word);
    const testWords = results.testWords;
    // const interferenceWords = results.interferenceWords;

    // Compute total recall score (number of words correctly recalled)
    const totalRecallScore = testWords.filter((w) =>
        transcribedWords.includes(w)
    ).length;

    const pairwiseSimilarities = pairwiseSimilarityCalculations(
        testWords,
        transcribedWords
    );
    let similarityIndex = 0;
    for (const word in pairwiseSimilarities) {
        similarityIndex += pairwiseSimilarities[word].similarity;
    }

    // Update total recall score in database
    RAVLTResults.findOneAndUpdate(
        { trialID: trialID },
        { totalRecallScore: totalRecallScore, similarityIndex: similarityIndex }
    )
        .then(() => {
            res.send({
                msg: "RAVLT results updated",
                totalRecallScore: totalRecallScore,
                similarityIndex: similarityIndex,
            });
        })
        .catch((error) => {
            console.error("Error updating RAVLT results:", error);
            res.status(500).send({ msg: "Error updating RAVLT results" });
        });
});

/**
 * @route POST /ravlt/addResults
 * @description Add RAVLT results to the database
 * @access Public
 * @param {Object} req.body - The RAVLT results
 * @param {string} req.body.patientID - ID of the patient
 * @param {string} req.body.trialID - ID of the trial
 * @param {string} req.body.transcriptionID - ID of the transcription
 * @param {Array} req.body.transcribedWords - Array of transcribed words
 * @param {Array} req.body.testWords - Array of test words
 * @param {Array} req.body.interferenceWords - Array of interference words
 * @param {number} req.body.totalRecallScore - Total recall score of the test
 * @param {number} req.body.similarityIndex - Similarity index of the test
 * @param {number} req.body.primacyRecencyIndex - Primacy recency index of the test
 * @returns {Object} - JSON object with success or error message
 */
router.post("/addResults", (req, res) => {
    if (
        !req.body.patientID ||
        !req.body.trialID ||
        !req.body.transcriptionID ||
        !req.body.transcribedWords ||
        !req.body.testWords ||
        !req.body.interferenceWords ||
        req.body.totalRecallScore == null ||
        req.body.similarityIndex == null ||
        req.body.primacyRecencyIndex == null
    ) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const RAVLT = new RAVLTResults(req.body);
    RAVLT.save()
        .then(() => {
            res.send({ msg: "RAVLT results added" });
        })
        .catch((error) => {
            console.error("Error adding RAVLT results:", error);
            res.status(500).send({ msg: "Error adding RAVLT results" });
        });
});

router.get("/getResultsByTrialID", (req, res) => {
    const trialID = req.query.trialID;
    RAVLTResults.findOne({ trialID: trialID })
        .then((results) => {
            res.send(results);
        })
        .catch((error) => {
            console.error("Error getting RAVLT results:", error);
            res.status(500).send({ msg: "Error getting RAVLT results" });
        });
});

export default router;