import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { BlobServiceClient } from "@azure/storage-blob";
import { StorageSharedKeyCredential } from "@azure/storage-blob";
import path from "path";
import Patient from "../Models/Patient.js";
import {
    generateAlphanumericSequence,
    sanitizeContainerName,
} from "../helperfunctions.js";
import { createContainer } from "../Endpoints/AudioStorage.js";
// Load environment variables

const router = express.Router();

// Initialize Azure Blob Service client
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AUDIO_STORAGE_CONNECTION_STRING
);
// Set up key info into Blob Storage
const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AUDIO_STORAGE_ACCOUNT_NAME,
    process.env.AUDIO_STORAGE_KEY
);

router.get("/", (req, res) => {
    res.send("Admin API is running");
});

/**
 * @route POST /api/admin/generateTestingTrial
 * @description Generate a testing patient, trial, and upload test audio files
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.test - Test type (e.g., "RAVLT")
 * @returns {Object} - JSON object with success or error message
 */
router.post("/generateTestingTrial", async (req, res) => {
    // Try and start generating a dummy patient and trial
    try {
        console.log("Generating Testing Trial", req.body);

        // Check if test type is provided
        if (!req.body.test) {
            return res.status(400).send({ msg: "Test type is required" });
        }

        // Only handle RAVLT test for now
        if (req.body.test !== "RAVLT") {
            return res
                .status(400)
                .send({ msg: "Only RAVLT test is supported currently" });
        }

        // Create a testing patient
        const patientID = "TEST-" + generateAlphanumericSequence(8);
        const testPatient = new Patient({
            patientID: patientID,
            firstName: "Test",
            lastName: "Patient",
            DOB: "2000-01-01",
            educationLevel: "College",
            ethnicity: "Test",
        });
        // Save the patient
        await testPatient.save();
        console.log("Test patient created with ID:", patientID);

        // Create a testing trial
        const trialID = generateAlphanumericSequence(10);
        const testTrial = new Trial({
            patientID: patientID,
            trialID: trialID,
            test: "RAVLT",
            date: new Date(),
            transcriptionID: "None",
        });
        // Save the trial
        await testTrial.save();
        // Clean up the container name
        const cleanedName = sanitizeContainerName(patientID + "-" + trialID);

        // Create container for the patient
        console.log("Creating container for patient:", cleanedName);
        // Create container and return response
        createContainer(blobServiceClient, cleanedName)
            .then((containerClient) => {
                // Log the created container if successful
                console.log("Container created for patient:", cleanedName);
            })
            .catch((error) => {
                // Log the error if container creation fails
                console.error("Error creating container:", error);
                res.status(500).send({ msg: "Error creating container" });
            });

        // Upload real audio files from the Data directory for RAVLT
        // RAVLT has 10 trials (0-9) in total

        // Get the list of audio files from the Data directory
        const dataDir = path.join(process.cwd(), "Data");
        const audioFiles = fs
            .readdirSync(dataDir)
            .filter((file) => file.endsWith(".wav") || file.endsWith(".mp3"));

        if (audioFiles.length === 0) {
            throw new Error("No audio files found in the Data directory");
        }

        // Upload test audio files
        const containerClient =
            blobServiceClient.getContainerClient(cleanedName);

        for (let i = 0; i < Math.min(10, audioFiles.length); i++) {
            try {
                // Get the audio file
                const audioFile = audioFiles[i % audioFiles.length];
                const audioFilePath = path.join(dataDir, audioFile);

                // Read the file data
                const fileData = fs.readFileSync(audioFilePath);

                // Create a unique blob name
                const blobName = `${patientID}_${trialID}_${i}.wav`;

                // Upload to Azure Blob Storage
                const blockBlobClient =
                    containerClient.getBlockBlobClient(blobName);
                await blockBlobClient.upload(fileData, fileData.length);
                // Log the uploaded file
                console.log(
                    `Uploaded test audio file ${i + 1}/${Math.min(
                        10,
                        audioFiles.length
                    )}: ${blobName} (using ${audioFile})`
                );
            } catch (error) {
                console.error(`Error uploading audio file ${i + 1}:`, error);
                throw error; // Rethrow to be caught by the outer try/catch
            }
        }
        // Log the completion of the test trial generation
        res.status(200).send({
            msg: "Test trial generated successfully",
            patientID: patientID,
            trialID: trialID,
        });
    } catch (error) {
        // Log the error if test trial generation fails
        console.error("Error generating test trial:", error);
        res.status(500).send({
            msg: "Error generating test trial",
            error: error.message,
        });
    }
});

// Export the router directly for Express to use
export default router;
