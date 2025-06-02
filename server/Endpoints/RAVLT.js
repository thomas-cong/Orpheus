import express from "express";
import RAVLTTrial from "../Models/RAVLTTrial.js";
import RAVLTResults from "../Models/RAVLTResults.js";
import pairwiseSimilarityCalculations from "../AnalysisAlgorithms/PairwiseSimilarityCalculations.js";
import { generateAlphanumericSequence } from "../helperfunctions.js";

const router = express.Router();

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
            status: "incomplete",
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
