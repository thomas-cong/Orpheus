import express from "express";
import { getEmbedding, cosineSimilarity } from "../helperfunctions.js";

const router = express.Router();

router.get("/semantic-similarity", async (req, res) => {
    const { text1, text2 } = req.query;

    if (!text1 || !text2) {
        return res
            .status(400)
            .json({ error: "Both text1 and text2 are required." });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res
            .status(500)
            .json({ error: "OPENAI_API_KEY environment variable not set." });
    }

    try {
        const embedding1 = await getEmbedding(text1);
        const embedding2 = await getEmbedding(text2);

        if (embedding1 && embedding2) {
            const similarity = cosineSimilarity(embedding1, embedding2);
            res.json({ similarity });
        } else {
            res.status(500).json({ error: "Failed to generate embeddings." });
        }
    } catch (error) {
        console.error("Error calculating semantic similarity:", error);
        res.status(500).json({
            error: "An unexpected error occurred.",
            details: error.message,
        });
    }
});

export default router;
