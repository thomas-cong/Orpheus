import express from "express";
import RAVLTResults from "../Models/RAVLTResults.js";
import { getEmbedding, cosineSimilarity } from "../helperfunctions.js";
import pairwiseSimilarityCalculations from "../AnalysisAlgorithms/PairwiseSimilarityCalculations.js";

const router = express.Router();

/**
 * @route POST /ravlt/calculateResults
 * @description Calculate RAVLT results for a given trial
 * @param {string} trialID - The ID of the trial
 * @returns {Object} - The calculated RAVLT results
 */
router.post("/calculateResults", async (req, res) => {
    if (!req.body.trialID) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const { trialID } = req.body;
    const results = await RAVLTResults.findOne({
        trialID: trialID,
    });
    if (!results || !results.transcribedWords) {
        return res.status(400).send({ msg: "Missing transcribed words" });
    }
    if (results.totalRecallScore < 0 || results.semanticSimilarityIndex < 0) {
        const transcribedWords = results.transcribedWords.map((w) => w.word);
        const testWords = results.testWords;

        // Compute total recall score (number of words correctly recalled)
        const totalRecallScore = testWords.filter((w) =>
            transcribedWords.includes(w)
        ).length;

        // Calculate pairwise similarity
        const similarityMap = pairwiseSimilarityCalculations(
            transcribedWords,
            testWords
        );
        const similarityIndex = Object.values(similarityMap).reduce(
            (sum, item) => sum + item.similarity,
            0
        );
        console.log(testWords);
        // Compute embeddings for all words in testWords and transcribedWords
        const testWordEmbeddings = await getEmbedding(testWords);
        const transcribedWordEmbeddings = await getEmbedding(transcribedWords);

        // Filter out any null embeddings
        const validTestEmbeddings = testWordEmbeddings.filter((e) => e);
        const validTranscribedEmbeddings = transcribedWordEmbeddings.filter(
            (e) => e
        );

        let semanticSimilarityIndex = 0;
        if (
            validTestEmbeddings.length > 0 &&
            validTranscribedEmbeddings.length > 0
        ) {
            for (const testEmbedding of validTestEmbeddings) {
                let maxSim = 0;
                for (const transcribedEmbedding of validTranscribedEmbeddings) {
                    const sim = cosineSimilarity(
                        testEmbedding,
                        transcribedEmbedding
                    );
                    if (sim > maxSim) maxSim = sim;
                }
                semanticSimilarityIndex += maxSim;
            }
        }
        try {
            await RAVLTResults.findOneAndUpdate(
                { trialID: trialID },
                {
                    totalRecallScore: totalRecallScore,
                    semanticSimilarityIndex: semanticSimilarityIndex,
                    similarityIndex: similarityIndex,
                }
            );
            console.log("Results updated");
            res.send({
                msg: "RAVLT results updated",
                totalRecallScore: totalRecallScore,
                semanticSimilarityIndex: semanticSimilarityIndex,
                similarityIndex: similarityIndex,
            });
        } catch (error) {
            console.error("Error updating RAVLT results:", error);
            res.status(500).send({ msg: "Error updating RAVLT results" });
        }
    } else {
        res.send({
            msg: "RAVLT results already calculated",
            totalRecallScore: results.totalRecallScore,
            semanticSimilarityIndex: results.semanticSimilarityIndex,
            similarityIndex: results.similarityIndex,
        });
    }
});

export default router;
