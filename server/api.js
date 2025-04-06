import express from "express";
import fs from "fs";

const router = express.Router();
const wordsContent = fs.readFileSync("./Data/words.txt", "utf-8");
const wordArray = wordsContent.split("\n");
router.get("/", (req, res) => {
    res.send("API is running");
});
// Generate words, req.query.numWords is the number of words to generate
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
router.all("*", (req, res) => {
    console.log(`API route not found: ${req.method} ${req.url}`);
    res.status(404).send({ msg: "API route not found" });
});

// Export the router directly for Express to use
export default router;
