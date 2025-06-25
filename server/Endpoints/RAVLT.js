import express from "express";
import RAVLTTrial from "../Models/RAVLTTrial.js";
import RAVLTResults from "../Models/RAVLTResults.js";
import {
    generateAlphanumericSequence,
    getEmbedding,
    cosineSimilarity,
} from "../helperfunctions.js";
import pairwiseSimilarityCalculations from "../AnalysisAlgorithms/PairwiseSimilarityCalculations.js";

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

    // Compute total recall score (number of words correctly recalled)
    const totalRecallScore = testWords.filter((w) =>
        transcribedWords.includes(w)
    ).length;

    // Calculate pairwise similarity
    const similarityMap = pairwiseSimilarityCalculations(
        transcribedWords,
        testWords
    );
    const similarityIndex = Object.values(similarityMap).reduce(
        (sum, item) => sum + item.similarity,
        0
    );
    console.log(testWords);
    // Compute embeddings for all words in testWords and transcribedWords
    const testWordEmbeddings = await Promise.all(
        testWords.map((word) => getEmbedding(word))
    );
    const transcribedWordEmbeddings = await Promise.all(
        transcribedWords.map((word) => getEmbedding(word))
    );

    // Filter out any null embeddings
    const validTestEmbeddings = testWordEmbeddings.filter((e) => e);
    const validTranscribedEmbeddings = transcribedWordEmbeddings.filter(
        (e) => e
    );

    let semanticSimilarityIndex = 0;
    if (
        validTestEmbeddings.length > 0 &&
        validTranscribedEmbeddings.length > 0
    ) {
        for (const testEmbedding of validTestEmbeddings) {
            let maxSim = 0;
            for (const transcribedEmbedding of validTranscribedEmbeddings) {
                const sim = cosineSimilarity(
                    testEmbedding,
                    transcribedEmbedding
                );
                if (sim > maxSim) maxSim = sim;
            }
            semanticSimilarityIndex += maxSim;
        }
    }

    // Update total recall score and the new semantic similarity index in the database
    try {
        await RAVLTResults.findOneAndUpdate(
            { trialID: trialID },
            {
                totalRecallScore: totalRecallScore,
                semanticSimilarityIndex: semanticSimilarityIndex,
                similarityIndex: similarityIndex,
            }
        );
        res.send({
            msg: "RAVLT results updated",
            totalRecallScore: totalRecallScore,
            semanticSimilarityIndex: semanticSimilarityIndex,
            similarityIndex: similarityIndex,
        });
    } catch (error) {
        console.error("Error updating RAVLT results:", error);
        res.status(500).send({ msg: "Error updating RAVLT results" });
    }
});
router.post("/updateTrial", (req, res) => {
    if (!req.body.trialID || !req.body.patientID) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const { trialID, patientID, date, status } = req.body;

    // Create update object with required fields
    const updateData = { patientID };

    // Add optional fields if they exist
    if (date) updateData.date = date;
    if (status) updateData.status = status;

    RAVLTTrial.findOneAndUpdate({ trialID: trialID }, updateData)
        .then(() => {
            res.send({ msg: "RAVLT trial updated" });
        })
        .catch((error) => {
            console.error("Error updating RAVLT trial:", error);
            res.status(500).send({ msg: "Error updating RAVLT trial" });
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
        req.body.semanticSimilarityIndex == null
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
router.get("/getTrialByTrialID", (req, res) => {
    if (!req.query.trialID) {
        return res.status(400).send({ msg: "Missing trial ID" });
    }
    RAVLTTrial.findOne({ trialID: req.query.trialID })
        .then((trial) => {
            if (trial.trialID) {
                res.json({ trial: trial });
            } else {
                res.json({ msg: "Trial not found" });
            }
        })
        .catch((error) => {
            res.json({ msg: "Trial not found" });
        });
});

export default router;
