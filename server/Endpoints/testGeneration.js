import express from "express";
import fs from "fs";

const router = express.Router();

// Read words from file
const wordsContent = fs.readFileSync("./Data/words.txt", "utf-8");
const wordArray = wordsContent.split("\n");

/**
 * @route GET /testHelper/generateWords
 * @description Generate a list of random words for testing purposes
 * @access Public
 * @param {number} req.query.numWords - Number of random words to generate
 * @returns {Object} - JSON object containing an array of random words
 * @returns {string[]} words - Array of randomly selected words
 */
router.get("/generateWords", (req, res) => {
    const numWords = parseInt(req.query.numWords, 10);
    let blacklist = [];
    if (req.query.wordBlacklist) {
        // Accept comma-separated or array
        if (Array.isArray(req.query.wordBlacklist)) {
            blacklist = req.query.wordBlacklist;
        } else {
            blacklist = req.query.wordBlacklist
                .split(",")
                .map((w) => w.trim())
                .filter(Boolean);
        }
    }
    console.log("Num words to generate:", numWords, "Blacklist:", blacklist);
    // Remove empty or whitespace-only entries
    let uniqueWords = Array.from(
        new Set(wordArray.filter((w) => w && w.trim().length > 0))
    );
    if (blacklist.length > 0) {
        const blacklistSet = new Set(blacklist);
        uniqueWords = uniqueWords.filter((w) => !blacklistSet.has(w));
    }
    if (numWords > uniqueWords.length) {
        return res.status(400).json({
            error: `Requested ${numWords} words, but only ${uniqueWords.length} unique words available after applying blacklist.`,
        });
    }
    // Fisher-Yates shuffle
    for (let i = uniqueWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueWords[i], uniqueWords[j]] = [uniqueWords[j], uniqueWords[i]];
    }
    const wordsToReturn = uniqueWords.slice(0, numWords);
    res.json({ words: wordsToReturn });
});

export default router;
