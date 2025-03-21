// Importing module
import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
const app = express();
const PORT = 3000;

// Add this CORS middleware before your routes
app.use(
    cors({
        origin: "http://localhost:5173", // Your React app's URL
        methods: ["GET", "POST"],
        credentials: true,
    })
);
const wordsContent = fs.readFileSync("./Data/words.txt", "utf-8");
const wordArray = wordsContent.split("\n");
// Handling GET / Request
app.get("/", (req, res) => {
    res.send("Welcome to typescript backend!. test");
});

// Generate words, req.query.numWords is the number of words to generate
app.get("/api/generateWords", (req, res) => {
    let wordsToReturn = [];
    for (let i = 0; i < req.query.numWords; i++) {
        const randomWord =
            wordArray[Math.floor(Math.random() * wordArray.length)];
        wordsToReturn.push(randomWord);
    }
    res.json({ words: wordsToReturn });
});

// Server setup
app.listen(PORT, () => {
    console.log(
        "The application is listening " + "on port http://localhost:" + PORT
    );
});
