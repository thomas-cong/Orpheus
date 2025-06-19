import express from "express";
import ROTrial from "../Models/ROTrial.js";
import ROResults from "../Models/ROResults.js";
import { generateAlphanumericSequence } from "../helperfunctions.js";

const router = express.Router();

// ======================================================
// TRIAL MANAGEMENT
// ======================================================
/**
 * @route POST /ro/createTrial
 * @description Generate a unique trial ID and create a new RAVLT trial in the database
 * @access Public
 * @returns {Object} - JSON object containing the generated trial ID
 */
router.post("/createTrial", async (req, res) => {
    try {
        let unique = false;
        let trialID;

        while (!unique) {
            trialID = "RO-" + generateAlphanumericSequence(10);
            const exists = await ROTrial.findOne({ trialID: trialID });
            if (!exists) {
                unique = true;
            }
        }

        // Create a new trial with empty patientID, current date, and incomplete status
        let trial = new ROTrial({
            trialID: trialID,
            patientID: "", // Empty patientID as requested
            date: new Date(), // Current date
            test: "RO",
            status: "incomplete",
        });

        await trial.save();
        res.json({ trialID: trialID });
    } catch (error) {
        console.error("Error initiating RO trial:", error);
        res.status(500).json({ error: "Failed to initiate RO trial" });
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

    ROTrial.findOneAndUpdate({ trialID: trialID }, updateData)
        .then(() => {
            res.send({ msg: "RO trial updated" });
        })
        .catch((error) => {
            console.error("Error updating RO trial:", error);
            res.status(500).send({ msg: "Error updating RO trial" });
        });
});
/**

router.get("/getResultsByTrialID", (req, res) => {
    const trialID = req.query.trialID;
    ROResults.findOne({ trialID: trialID })
        .then((results) => {
            res.send(results);
        })
        .catch((error) => {
            console.error("Error getting RO results:", error);
            res.status(500).send({ msg: "Error getting RO results" });
        });
});
router.get("/getTrialByTrialID", (req, res) => {
    if (!req.query.trialID) {
        return res.status(400).send({ msg: "Missing trial ID" });
    }
    ROTrial.findOne({ trialID: req.query.trialID })
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
