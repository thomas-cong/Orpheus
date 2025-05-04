import express from "express";
import Trial from "../Models/Trial.js";
import { generateAlphanumericSequence } from "../helperfunctions.js";
import RAVLTResults from "../Models/RAVLTResults.js";
// import '@tensorflow/tfjs-node';
// import * as use from '@tensorflow-models/universal-sentence-encoder';
// import natural from 'natural';
// const { JaroWinklerDistance } = natural;

const router = express.Router();

let useModel;
async function getUseModel() {
    if (!useModel) useModel = await use.load();
    return useModel;
}

async function cosineSemantic(word1, word2) {
    const model = await getUseModel();
    const embeddings = await model.embed([word1, word2]);
    const array = await embeddings.array();
    const [v1, v2] = array;
    let dot = 0, n1 = 0, n2 = 0;
    for (let i = 0; i < v1.length; i++) {
        dot += v1[i] * v2[i];
        n1 += v1[i] * v1[i];
        n2 += v2[i] * v2[i];
    }
    return dot / (Math.sqrt(n1) * Math.sqrt(n2));
}

/**
 * Compute phonetic similarity between two words using SoundEx + Jaro-Winkler
 * @param {string} w1 - first word
 * @param {string} w2 - second word
 * @returns {number} similarity score [0–1]
 */
function phoneticSimilarity(w1, w2) {
    // Just use string similarity directly - simpler and more reliable
    return JaroWinklerDistance(w1, w2);
}

/**
 * @route GET /api/trials/genTrialID
 * @description Generate a unique trial ID
 * @access Public
 * @returns {Object} - JSON object containing the generated trial ID
 */
router.get("/genTrialID", async (req, res) => {
    try {
        let unique = false;
        let trialID;

        while (!unique) {
            trialID = generateAlphanumericSequence(10);
            const exists = await Trial.findOne({ trialID: trialID });
            if (!exists) {
                unique = true;
            }
        }

        res.json({ trialID: trialID });
    } catch (error) {
        console.error("Error generating trial ID:", error);
        res.status(500).json({ error: "Failed to generate trial ID" });
    }
});

/**
 * @route POST /api/trials/addTrial
 * @description Add a new trial to the database
 * @access Public
 * @param {Object} req.body - The trial information
 * @param {string} req.body.patientID - ID of the patient
 * @param {string} req.body.date - Date of the trial
 * @param {string} req.body.test - Type of test performed
 * @param {string} req.body.trialID - Unique identifier for the trial
 * @returns {Object} - JSON object with success or error message
 */
router.post("/addTrial", (req, res) => {
    if (
        !req.body.patientID ||
        !req.body.date ||
        !req.body.test ||
        !req.body.trialID
    ) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const trial = new Trial(req.body);
    trial
        .save()
        .then(() => {
            res.send({ msg: "Trial added" });
        })
        .catch((error) => {
            console.error("Error adding trial:", error);
            res.status(500).send({ msg: "Error adding trial" });
        });
});

/**
 * @route POST /api/trials/addRAVLTResults
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
router.post("/addRAVLTResults", (req, res) => {
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
    RAVLT
        .save()
        .then(() => {
            res.send({ msg: "RAVLT results added" });
        })
        .catch((error) => {
            console.error("Error adding RAVLT results:", error);
            res.status(500).send({ msg: "Error adding RAVLT results" });
        });
})

router.post("/calculateRAVLTResults", async (req, res) => {
    if (!req.body.patientID || !req.body.trialID) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const { patientID, trialID } = req.body;
    const results = await RAVLTResults.findOne({ patientID: patientID, trialID: trialID });
    if (!results.transcribedWords) {
        return res.status(400).send({ msg: "Missing transcribed words" });
    }
    const transcribedWords = results.transcribedWords.map(w => w.word);
    const testWords = results.testWords;
    // const interferenceWords = results.interferenceWords;

    // Compute total recall score (number of words correctly recalled)
    const totalRecallScore = testWords.filter(w => transcribedWords.includes(w)).length;

    // Compute semantic similarity via cosine of USE embeddings
    // const semanticScores = [];
    // const phoneticScores = [];
    // let wordIndex = 0;
    // for (const tw of testWords) {
    //     semanticScores.push([]);
    //     phoneticScores.push([]);
    //     for (const twTrans of transcribedWords) {
    //         const semanticSim = cosineSemantic(tw, twTrans);
    //         semanticScores[wordIndex].push(semanticSim);
    //         const phoneticSim = phoneticSimilarity(tw, twTrans);
    //         phoneticScores[wordIndex].push(phoneticSim);
    // }
    //     wordIndex++;
    // }

    // let similarityIndex = 0;
    // const usedTranscribed = new Set();
    // const usedTest = new Set();
    // for (let i = 0; i < Math.min(testWords.length, transcribedWords.length); i++) {
    //     let bestScore = 0;
    //     let bestTranscribed = 0;
    //     let bestTest = 0;
    //     for (let j = 0; j < transcribedWords.length; j++) {
    //         if (usedTranscribed.has(j)) continue;
    //         for (let k = 0; k < testWords.length; k++) {
    //             if (usedTest.has(k)) continue;
    //             const score = Math.max(semanticScores[i][j], phoneticScores[i][j]);
    //             if (score > bestScore) {
    //                 bestScore = score;
    //                 bestTranscribed = j;
    //                 bestTest = k;
    //             }
    //         }
    //     }
    //     similarityIndex += bestScore;
    //     usedTranscribed.add(bestTranscribed);
    //     usedTest.add(bestTest);
    // }
    RAVLTResults.findOneAndUpdate({ patientID: patientID, trialID: trialID }, { totalRecallScore: totalRecallScore })
        .then(() => {
            res.send({ msg: "RAVLT results updated", totalRecallScore: totalRecallScore });
        })
        .catch((error) => {
            console.error("Error updating RAVLT results:", error);
            res.status(500).send({ msg: "Error updating RAVLT results" });
        });
});

router.get("/getTrials", (req, res) => {
    if (!req.query.patientID) {
        return res.status(400).send({ msg: "Missing patient ID" });
    }
    Trial.find({ patientID: req.query.patientID })
        .then((trials) => {
            res.json({ trials: trials });
        })
        .catch((error) => {
            console.error("Error getting trials:", error);
            res.status(500).json({ error: "Failed to get trials" });
        });
});

export default router;
