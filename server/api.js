import express from "express";
import fs from "fs";
import Patient from "./Models/Patient.js";
import Trial from "./Models/Trial.js";
import {
    stringToNumber,
    sanitizeContainerName,
    generateAlphanumericSequence,
} from "./helperfunctions.js";
const router = express.Router();

const wordsContent = fs.readFileSync("./Data/words.txt", "utf-8");
const wordArray = wordsContent.split("\n");

import dotenv from "dotenv";
dotenv.config();

import { BlobServiceClient } from "@azure/storage-blob";
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING
);
/**
 * @route GET /api
 * @description Check if the API is running
 * @access Public
 * @returns {string} - Simple text message indicating the API is running
 */
router.get("/", (req, res) => {
    res.send("API is running");
});
/**
 * @route GET /api/testhelper/generateWords
 * @description Generate a list of random words for testing purposes
 * @access Public
 * @param {number} req.query.numWords - Number of random words to generate
 * @returns {Object} - JSON object containing an array of random words
 * @returns {string[]} words - Array of randomly selected words
 */
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

/**
 * @route GET /api/patients/genPatientID
 * @description Generate a deterministic patient ID based on patient information
 * @access Public
 * @param {string} req.query.firstName - Patient's first name
 * @param {string} req.query.lastName - Patient's last name
 * @param {string} req.query.DOB - Patient's date of birth
 * @returns {Object} - JSON object containing the generated patient ID
 * @returns {string} patientID - The generated patient ID with format "P-[hash]"
 */
router.get("/patients/genPatientID", (req, res) => {
    let patientID =
        "P-" +
        stringToNumber(
            req.query.firstName + req.query.lastName + req.query.DOB
        );
    res.json({ patientID: patientID });
});
/**
 * @route GET /api/patients/getPatientInfo
 * @description Retrieve patient information from the database by patient ID
 * @access Public
 * @param {string} req.query.patientID - The patient ID to look up
 * @returns {Object} - Either the patient information object or an error message
 * @returns {string} [msg] - Error message if patient not found or server error
 */
router.get("/patients/getPatient", (req, res) => {
    // Queries patient info from MongoDB
    Patient.findOne({ patientID: req.query.patientID })
        .then((patient) => {
            // Returns patient info if found
            if (patient) {
                res.json(patient);
            } else {
                res.json({ msg: "Patient not found" });
            }
        })
        .catch((error) => {
            console.error("Error getting patient info:", error);
            res.status(500).send({ msg: "Error getting patient info" });
        });
});
/**
 * @route POST /api/patients/addPatient
 * @description Add a new patient to the database
 * @access Public
 * @param {Object} req.body - The patient information
 * @param {string} req.body.patientID - Unique identifier for the patient
 * @param {string} req.body.firstName - Patient's first name
 * @param {string} req.body.lastName - Patient's last name
 * @param {string} req.body.DOB - Patient's date of birth
 * @param {string} req.body.educationLevel - Patient's education level
 * @param {string} req.body.ethnicity - Patient's ethnicity
 * @returns {Object} - JSON object with success or error message
 * @returns {string} msg - Success or error message
 */
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
    const patient = new Patient(req.body);
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
/**
 * @route GET /api/audioStorage/getContainer
 * @description Get a reference to an Azure Blob Storage container
 * @access Public
 * @param {string} req.query.containerName - Name of the container to retrieve
 * @returns {Object} - JSON object with container client or error message
 * @returns {Object} containerClient - Azure Blob Storage container client
 * @returns {string} [msg] - Error message if container retrieval fails
 */
router.get("/audioStorage/getContainer", (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);
    async function getContainer(containerName) {
        const containerClient =
            blobServiceClient.getContainerClient(containerName);
        const exists = await containerClient.exists();
        return { containerClient, exists };
    }
    getContainer(cleanedName)
        .then(({ containerClient, exists }) => {
            if (exists) {
                res.send({ containerName: cleanedName });
            } else {
                res.send({ msg: "Container not found" });
            }
        })
        .catch((error) => {
            console.error("Error getting container:", error);
            res.status(500).send({ msg: "Error getting container" });
        });
});
/**
 * @route DELETE /api/audioStorage/deleteContainer
 * @description Delete an Azure Blob Storage container
 * @access Public
 * @param {string} req.query.containerName - Name of the container to delete
 * @returns {Object} - JSON object with success or error message
 * @returns {string} msg - Success or error message
 */
router.delete("/audioStorage/deleteContainer", (req, res) => {
    // Validate container name
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    // Sanitize container name
    const cleanedName = sanitizeContainerName(req.query.containerName);
    // Delete container
    async function deleteContainer(blobServiceClient, containerName) {
        const containerClient =
            blobServiceClient.deleteContainer(containerName);
        return containerClient;
    }
    // Delete container and return response
    deleteContainer(blobServiceClient, cleanedName)
        .then(() => {
            res.send({ msg: "Container deleted" });
        })
        .catch((error) => {
            console.error("Error deleting container:", error);
            res.status(500).send({ msg: "Error deleting container" });
        });
});
/**
 * @route POST /api/audioStorage/createContainer
 * @description Create a new Azure Blob Storage container for storing audio files
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.containerName - Name for the new container (will be sanitized)
 * @returns {Object} - JSON object with container information or error message
 * @returns {string} msg - Success or error message
 * @returns {string} containerName - The sanitized container name used
 * @returns {Object} containerClient - Azure Blob Storage container client
 */
router.post("/audioStorage/createContainer", (req, res) => {
    // Validate container name
    if (!req.body.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    // Sanitize container name
    const cleanedName = sanitizeContainerName(req.body.containerName);
    // Create container and return response
    async function createContainer(blobServiceClient, containerName) {
        const containerClient = await blobServiceClient.createContainer(
            containerName
        );
        return containerClient;
    }
    // Create container and return response
    createContainer(blobServiceClient, cleanedName)
        .then((containerClient) => {
            res.send({
                msg: "Container created",
                containerName: cleanedName,
            });
        })
        .catch((error) => {
            console.error("Error creating container:", error);
            res.status(500).send({ msg: "Error creating container" });
        });
});

/**
 * @route POST /api/audioStorage/uploadBlob
 * @description Upload a blob to Azure Blob Storage
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.containerName - Name of the container to upload to
 * @param {string} req.body.blobName - Name to give the blob in storage
 * @param {ArrayBuffer} req.body.data - The blob data as an ArrayBuffer
 * @returns {Object} - JSON object with success or error message
 */
router.post("/audioStorage/uploadBlob", async (req, res) => {
    if (!req.body.containerName || !req.body.blobName || !req.body.data) {
        return res.status(400).send({ msg: "Missing required fields" });
    }

    const cleanedName = sanitizeContainerName(req.body.containerName);
    async function getContainer(containerName) {
        const containerClient =
            blobServiceClient.getContainerClient(containerName);
        const exists = await containerClient.exists();
        return { containerClient, exists };
    }
    try {
        // Get container client
        const { containerClient } = await getContainer(cleanedName);

        // Get blob client
        const blockBlobClient = containerClient.getBlockBlobClient(
            req.body.blobName
        );

        // Convert Base64 to Buffer for upload
        const buffer = Buffer.from(req.body.data, "base64");

        // Upload the blob
        await blockBlobClient.upload(buffer, buffer.length);

        res.send({
            msg: "Blob uploaded successfully",
            blobName: req.body.blobName,
            containerName: cleanedName,
        });
    } catch (error) {
        console.error("Error uploading blob:", error);
        res.status(500).send({ msg: "Error uploading blob" });
    }
});
router.get("/trials/genTrialID", async (req, res) => {
    while (true) {
        const trialID = generateAlphanumericSequence(10);
        async function checkTrialID(trialID) {
            const exists = await Trial.findOne({ trialID: trialID });
            return exists;
        }
        const exists = await checkTrialID(trialID);
        if (!exists) {
            res.send({ trialID: trialID });
            break;
        }
    }
});

/**
 * @route ALL *
 * @description Catch-all route for undefined endpoints
 * @access Public
 * @returns {Object} - JSON object with error message
 * @returns {string} msg - Error message indicating route not found
 */
router.all("*", (req, res) => {
    console.log(`API route not found: ${req.method} ${req.url}`);
    res.status(404).send({ msg: "API route not found" });
});
// Export the router directly for Express to use
export default router;
