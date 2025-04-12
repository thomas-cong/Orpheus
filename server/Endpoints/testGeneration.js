import express from "express";
import fs from "fs";

const router = express.Router();

// Read words from file
const wordsContent = fs.readFileSync("./Data/words.txt", "utf-8");
const wordArray = wordsContent.split("\n");

/**
 * @route GET /api/testhelper/generateWords
 * @description Generate a list of random words for testing purposes
 * @access Public
 * @param {number} req.query.numWords - Number of random words to generate
 * @returns {Object} - JSON object containing an array of random words
 * @returns {string[]} words - Array of randomly selected words
 */
router.get("/generateWords", (req, res) => {
    console.log("Num words to generate: ", req.query.numWords);
    let wordsToReturn = [];
    for (let i = 0; i < req.query.numWords; i++) {
        const randomWord =
            wordArray[Math.floor(Math.random() * wordArray.length)];
        wordsToReturn.push(randomWord);
    }
    res.json({ words: wordsToReturn });
});

export default router;
