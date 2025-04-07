import express from "express";
import fs from "fs";
import PatientInfo from "./Models/PatientInfo.js";
import { stringToNumber } from "./helperfunctions.js";
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

// Get patient ID pseudo-randomly
router.get("/genPatientID", (req, res) => {
    let patientID =
        "P-" +
        stringToNumber(
            req.query.firstName + req.query.lastName + req.query.DOB
        );
    res.json({ patientID: patientID });
});
// Get patient info from ID
router.get("/getPatientInfo", (req, res) => {
    PatientInfo.findOne({ patientID: req.query.patientID })
        .then((patient) => {
            if (patient) {
                res.json(patient);
            } else {
                res.status(404).send({ msg: "Patient not found" });
            }
        })
        .catch((error) => {
            console.error("Error getting patient info:", error);
            res.status(500).send({ msg: "Error getting patient info" });
        });
});
// Add a new patient
router.post("/addPatient", (req, res) => {
    console.log("Adding patient: ", req.body);
    if (
        !req.body.patientID ||
        !req.body.DOB ||
        !req.body.educationLevel ||
        !req.body.ethnicity ||
        !req.body.firstName ||
        !req.body.lastName
    ) {
        res.status(400).send({ msg: "Missing required fields" });
        return;
    }
    const patient = new PatientInfo(req.body);
    patient
        .save()
        .then(() => {
            res.send({ msg: "Patient added" });
        })
        .catch((error) => {
            console.error("Error adding patient:", error);
            res.status(500).send({ msg: "Error adding patient" });
        });
});
// Catch-all
router.all("*", (req, res) => {
    console.log(`API route not found: ${req.method} ${req.url}`);
    res.status(404).send({ msg: "API route not found" });
});
// Export the router directly for Express to use
export default router;
