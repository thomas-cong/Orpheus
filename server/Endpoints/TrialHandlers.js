import { generateAlphanumericSequence } from "../helperfunctions.js";

/**
 * Factory that returns an Express handler to create a new trial document.
 * @param {mongoose.Model} TrialModel - Mongoose model for the trial.
 * @param {string} prefix - Prefix for the generated trialID, e.g. "RO-".
 */
export function createTrialHandler(TrialModel, prefix) {
    return async (req, res) => {
        try {
            let unique = false;
            let trialID;
            while (!unique) {
                trialID = `${prefix}${generateAlphanumericSequence(10)}`;
                const exists = await TrialModel.findOne({ trialID });
                if (!exists) unique = true;
            }
            const trial = new TrialModel({ trialID });
            await trial.save();
            res.json({ trialID });
        } catch (err) {
            console.error("Error creating trial:", err);
            res.status(500).json({ error: "Failed to create trial" });
        }
    };
}

/**
 * Factory for updating an existing trial (patientID required).
 * Accepts optional date / status fields.
 */
export function updateTrialHandler(TrialModel) {
    return (req, res) => {
        if (!req.body.trialID || !req.body.patientID) {
            return res.status(400).send({ msg: "Missing required fields" });
        }
        const { trialID, patientID, date, status } = req.body;
        const updateData = { patientID };
        if (date) updateData.date = date;
        if (status) updateData.status = status;

        TrialModel.findOneAndUpdate({ trialID }, updateData)
            .then(() => res.send({ msg: "Trial updated" }))
            .catch((err) => {
                console.error("Error updating trial:", err);
                res.status(500).send({ msg: "Error updating trial" });
            });
    };
}

/**
 * Factory to upsert a Results document.
 * "coreFields" lists additional fields that may appear for this result type.
 */
export function addResultsHandler(ResultsModel, coreFields = []) {
    return async (req, res) => {
        const { patientID, trialID } = req.body;
        if (!patientID || !trialID) {
            return res.status(400).send({ msg: "Missing required fields" });
        }
        const updateData = { patientID, trialID };
        for (const f of coreFields) {
            if (req.body[f] !== undefined) updateData[f] = req.body[f];
        }
        try {
            await ResultsModel.findOneAndUpdate(
                { trialID },
                updateData,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            res.send({ msg: "Results saved" });
        } catch (err) {
            console.error("Error saving results:", err);
            res.status(500).send({ msg: "Error saving results" });
        }
    };
}

/**
 * Factory for GET /getResultsByTrialID
 */
export function getResultsHandler(ResultsModel) {
    return (req, res) => {
        const { trialID } = req.query;
        ResultsModel.findOne({ trialID })
            .then((r) => res.send(r))
            .catch((err) => {
                console.error("Error getting results:", err);
                res.status(500).send({ msg: "Error getting results" });
            });
    };
}

/**
 * Factory for GET /getTrialByTrialID
 */
export function getTrialHandler(TrialModel) {
    return (req, res) => {
        const { trialID } = req.query;
        if (!trialID) {
            return res.status(400).send({ msg: "Missing trial ID" });
        }
        TrialModel.findOne({ trialID })
            .then((t) => {
                if (t && t.trialID) res.json({ trial: t });
                else res.json({ msg: "Trial not found" });
            })
            .catch(() => res.json({ msg: "Trial not found" }));
    };
}
