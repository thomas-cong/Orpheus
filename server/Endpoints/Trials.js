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
router.get("/getTrialsByPatientID", async (req, res) => {
    if (!req.query.patientID) {
        return res.status(400).send({ msg: "Missing patient ID" });
    }

    try {
        // Use Promise.all to run both queries concurrently
        const [ravltTrials, roTrials] = await Promise.all([
            RAVLTTrial.find({ patientID: req.query.patientID }),
            ROTrial.find({ patientID: req.query.patientID }),
        ]);

        // Combine both trial types into one array
        const trial_list = [...ravltTrials, ...roTrials];

        // Send the response after all queries are complete
        res.json({ trials: trial_list });
    } catch (error) {
        console.error("Error getting trials:", error);
        res.status(500).json({ error: "Failed to get trials" });
    }
});
export default router;
