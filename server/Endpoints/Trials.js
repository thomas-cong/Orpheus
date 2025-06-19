import express from "express";
import RAVLTTrial from "../Models/RAVLTTrial.js";
import ROTrial from "../Models/ROTrial.js";

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
    let trial_list = [];
    RAVLTTrial.find({ patientID: req.query.patientID })
        .then((trials) => {
            trial_list = trial_list.concat(trials);
        })
        .catch((error) => {
            console.error("Error getting trials:", error);
            res.status(500).json({ error: "Failed to get trials" });
        });
    ROTrial.find({ patientID: req.query.patientID })
        .then((trials) => {
            trial_list = trial_list.concat(trials);
        })
        .catch((error) => {
            console.error("Error getting trials:", error);
            res.status(500).json({ error: "Failed to get trials" });
        });
    res.json({ trials: trial_list });
});
export default router;
