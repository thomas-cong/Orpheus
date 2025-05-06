import RAVLTResults from "../Models/RAVLTResults.js";
import pairwiseSimilarityCalculations from "../AnalysisAlgorithms/PairwiseSimilarityCalculations.js";
import express from "express";

const router = express.Router();

router.post("/calculateRAVLTResults", async (req, res) => {
    if (!req.body.patientID || !req.body.trialID) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const { patientID, trialID } = req.body;
    const results = await RAVLTResults.findOne({
        patientID: patientID,
        trialID: trialID,
    });
    if (!results || !results.transcribedWords) {
        return res.status(400).send({ msg: "Missing transcribed words" });
    }
    const transcribedWords = results.transcribedWords.map((w) => w.word);
    const testWords = results.testWords;
    // const interferenceWords = results.interferenceWords;

    // Compute total recall score (number of words correctly recalled)
    const totalRecallScore = testWords.filter((w) =>
        transcribedWords.includes(w)
    ).length;

    const pairwiseSimilarities = pairwiseSimilarityCalculations(
        testWords,
        transcribedWords
    );
    let similarityIndex = 0;
    for (const word in pairwiseSimilarities) {
        similarityIndex += pairwiseSimilarities[word].similarity;
    }

    // Update total recall score in database
    RAVLTResults.findOneAndUpdate(
        { patientID: patientID, trialID: trialID },
        { totalRecallScore: totalRecallScore, similarityIndex: similarityIndex }
    )
        .then(() => {
            res.send({
                msg: "RAVLT results updated",
                totalRecallScore: totalRecallScore,
                similarityIndex: similarityIndex,
            });
        })
        .catch((error) => {
            console.error("Error updating RAVLT results:", error);
            res.status(500).send({ msg: "Error updating RAVLT results" });
        });
});
export default router;
