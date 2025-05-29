import express from "express";
import RAVLTTrial from "../Models/RAVLTTrial.js";
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

/**
 * @route GET /api/trials/genTrialID
 * @description Generate a unique trial ID
 * @access Public
 * @returns {Object} - JSON object containing the generated trial ID
 */
router.get("/genRAVLTTrialID", async (req, res) => {
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
router.post("/addRAVLTTrial", (req, res) => {
    if (!req.body.trialID) {
        return res.status(400).send({ msg: "Missing trial ID" });
    }
    const trial = new RAVLTTrial(req.body);
    trial
        .save()
        .then(() => {
            res.send({ msg: "RAVLT Trial added" });
        })
        .catch((error) => {
            console.error("Error adding RAVLT trial:", error);
            res.status(500).send({ msg: "Error adding RAVLT trial" });
        });
});

/**
 * @route POST /api/trials/updateTrial
 * @description Update a trial in the database
 * @access Public
 * @param {Object} req.body - The trial information
 * @param {string} req.body.trialID - ID of the trial to update
 * @returns {Object} - JSON object with success or error message
 */
router.post("/updateRAVLTTrial", (req, res) => {
    if (!req.body.trialID) {
        return res.status(400).send({ msg: "Missing trial ID" });
    }
    RAVLTTrial.findOneAndUpdate({ trialID: req.body.trialID }, req.body)
        .then(() => {
            res.send({ msg: "RAVLT Trial updated" });
        })
        .catch((error) => {
            console.error("Error updating RAVLT trial:", error);
            res.status(500).send({ msg: "Error updating RAVLT trial" });
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
    RAVLT.save()
        .then(() => {
            res.send({ msg: "RAVLT results added" });
        })
        .catch((error) => {
            console.error("Error adding RAVLT results:", error);
            res.status(500).send({ msg: "Error adding RAVLT results" });
        });
});

router.get("/getRAVLTTrialsByPatientID", (req, res) => {
    if (!req.query.patientID) {
        return res.status(400).send({ msg: "Missing patient ID" });
    }
    RAVLTTrial.find({ patientID: req.query.patientID })
        .then((trials) => {
            res.json({ trials: trials });
        })
        .catch((error) => {
            console.error("Error getting trials:", error);
            res.status(500).json({ error: "Failed to get trials" });
        });
});
router.get("/getRAVLTTrialByTrialID", (req, res) => {
    if (!req.query.trialID) {
        return res.status(400).send({ msg: "Missing trial ID" });
    }
    RAVLTTrial.findOne({ trialID: req.query.trialID })
        .then((trial) => {
            res.json({ trial: trial });
        })
        .catch((error) => {
            res.json({ msg: "Trial not found" });
        });
});
export default router;
