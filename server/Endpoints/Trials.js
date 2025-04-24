import express from "express";
import Trial from "../Models/Trial.js";
import { generateAlphanumericSequence } from "../helperfunctions.js";

const router = express.Router();

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
