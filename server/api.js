import express from "express";
import fs from "fs";
import PatientInfo from "./Models/PatientInfo.js";
import { stringToNumber, sanitizeContainerName } from "./helperfunctions.js";
const router = express.Router();

const wordsContent = fs.readFileSync("./Data/words.txt", "utf-8");
const wordArray = wordsContent.split("\n");

import dotenv from "dotenv";
dotenv.config();
import { BlobServiceClient } from "@azure/storage-blob";
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING
);
router.get("/", (req, res) => {
    // Returns API status
    res.send("API is running");
});
// Generate words, req.query.numWords is the number of words to generate
router.get("/testhelper/generateWords", (req, res) => {
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
router.get("/patients/genPatientID", (req, res) => {
    let patientID =
        "P-" +
        stringToNumber(
            req.query.firstName + req.query.lastName + req.query.DOB
        );
    res.json({ patientID: patientID });
});
// Get patient info from ID
router.get("/patients/getPatientInfo", (req, res) => {
    // Queries patient info from MongoDB
    PatientInfo.findOne({ patientID: req.query.patientID })
        .then((patient) => {
            // Returns patient info if found
            if (patient) {
                res.json(patient);
            } else {
                res.json({ msg: "Patient not found" });
            }
        })
        .catch((error) => {
            // Returns error if patient not found
            console.error("Error getting patient info:", error);
            res.status(500).send({ msg: "Error getting patient info" });
        });
});
// Add a new patient
router.post("/patients/addPatient", (req, res) => {
    // Validates all fields exist
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
// Get Patient Container
router.get("/audioStorage/getContainer", (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);
    async function getContainerClient(containerName) {
        const containerClient =
            blobServiceClient.getContainerClient(containerName);
        return containerClient;
    }
    getContainerClient(cleanedName)
        .then((containerClient) => {
            res.send({ containerClient });
        })
        .catch((error) => {
            console.error("Error getting container:", error);
            res.status(500).send({ msg: "Error getting container" });
        });
});

// Create Patient Container
router.post("/audioStorage/createContainer", (req, res) => {
    if (!req.body.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.body.containerName);
    async function createContainer(blobServiceClient, containerName) {
        const containerClient = await blobServiceClient.createContainer(
            containerName
        );
        return containerClient;
    }
    createContainer(blobServiceClient, cleanedName)
        .then((containerClient) => {
            res.send({
                msg: "Container created",
                containerName: cleanedName,
                containerClient,
            });
        })
        .catch((error) => {
            console.error("Error creating container:", error);
            res.status(500).send({ msg: "Error creating container" });
        });
});
// Catch-all
router.all("*", (req, res) => {
    console.log(`API route not found: ${req.method} ${req.url}`);
    res.status(404).send({ msg: "API route not found" });
});
// Export the router directly for Express to use
export default router;
