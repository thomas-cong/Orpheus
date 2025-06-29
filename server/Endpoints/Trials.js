import express from "express";
import ROTrial from "../Models/ROTrial.js";
import RAVLTTrial from "../Models/RAVLTTrial.js";
import ROResults from "../Models/ROResults.js";
import RAVLTResults from "../Models/RAVLTResults.js";
import {
    createTrialHandler,
    updateTrialHandler,
    addResultsHandler,
    getResultsHandler,
    getTrialHandler,
} from "./TrialHandlers.js";

const router = express.Router();

// Configuration describing how each trial type maps to its models & extra result fields
const TRIAL_CONFIG = {
    RO: {
        trialModel: ROTrial,
        resultsModel: ROResults,
        prefix: "RO-",
        coreFields: ["imageBin", "similarityArray", "thresholdSimilarityArray"],
    },
    RAVLT: {
        trialModel: RAVLTTrial,
        resultsModel: RAVLTResults,
        prefix: "RAVLT-",
        coreFields: [
            "transcriptionID",
            "transcribedWords",
            "testWords",
            "interferenceWords",
            "totalRecallScore",
            "similarityIndex",
            "semanticSimilarityIndex",
            "primacyRecencyIndex",
        ],
    },
};

function cfgFromType(trialType) {
    return TRIAL_CONFIG[trialType];
}

function cfgFromTrialID(trialID) {
    if (trialID?.startsWith("RO-")) return TRIAL_CONFIG.RO;
    if (trialID?.startsWith("RAVLT-")) return TRIAL_CONFIG.RAVLT;
    return null;
}

// ---------------- Generic CRUD Endpoints ----------------
router.post("/createTrial", (req, res, next) => {
    const { trialType } = req.body;
    const cfg = cfgFromType(trialType);
    if (!cfg)
        return res.status(400).send({ msg: "Invalid or missing trialType" });
    return createTrialHandler(cfg.trialModel, cfg.prefix)(req, res, next);
});

router.post("/updateTrial", (req, res, next) => {
    const { trialType } = req.body;
    const cfg = cfgFromType(trialType);
    if (!cfg)
        return res.status(400).send({ msg: "Invalid or missing trialType" });
    return updateTrialHandler(cfg.trialModel)(req, res, next);
});

router.post("/addResults", (req, res, next) => {
    const { trialType } = req.body;
    const cfg = cfgFromType(trialType);
    if (!cfg)
        return res.status(400).send({ msg: "Invalid or missing trialType" });
    return addResultsHandler(cfg.resultsModel, cfg.coreFields)(req, res, next);
});

router.get("/getResultsByTrialID", (req, res, next) => {
    const { trialID } = req.query;
    const cfg = cfgFromTrialID(trialID);
    if (!cfg) return res.status(400).send({ msg: "Invalid trialID" });
    return getResultsHandler(cfg.resultsModel)(req, res, next);
});

router.get("/getTrialByTrialID", (req, res, next) => {
    const { trialID } = req.query;
    const cfg = cfgFromTrialID(trialID);
    if (!cfg) return res.status(400).send({ msg: "Invalid trialID" });
    return getTrialHandler(cfg.trialModel)(req, res, next);
});

/**
 * @route GET /trials/getTrialsByPatientID
 * @description Get all trials for a specific patient across all trial types
 */
router.get("/getTrialsByPatientID", async (req, res) => {
    const { patientID } = req.query;
    if (!patientID) return res.status(400).send({ msg: "Missing patientID" });
    try {
        const [ravltTrials, roTrials] = await Promise.all([
            RAVLTTrial.find({ patientID }),
            ROTrial.find({ patientID }),
        ]);
        res.json({ trials: [...ravltTrials, ...roTrials] });
    } catch (err) {
        console.error("Error getting trials:", err);
        res.status(500).json({ error: "Failed to get trials" });
    }
});

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
