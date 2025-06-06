import express from "express";
import RAVLTTrial from "../Models/RAVLTTrial.js";

const router = express.Router();

/**
 * @route GET /trials/getTrialsByPatientID
 * @description Get all trials for a specific patient
 * @access Public
 * @param {Object} req.query - The query parameters
 * @param {string} req.query.patientID - ID of the patient
 * @returns {Object} - JSON object containing the trials
 */
router.get("/getTrialsByPatientID", (req, res) => {
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
export default router;
