import express from "express";
import { BlobServiceClient } from "@azure/storage-blob";
import { StorageSharedKeyCredential } from "@azure/storage-blob";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { generateBlobSASQueryParameters } from "@azure/storage-blob";
import { sanitizeContainerName } from "../helperfunctions.js";
import RAVLTTrial from "../Models/RAVLTTrial.js";
import RAVLTResults from "../Models/RAVLTResults.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";
import {
    getContainer,
    deleteContainer,
    createContainer,
} from "../blobHelpers.js";
const upload = multer();

// Load environment variables
dotenv.config();

const router = express.Router();

// Initialize Azure Blob Service client
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING
);
const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.STORAGE_ACCOUNT_NAME,
    process.env.STORAGE_KEY
);

/**
 * @route GET /api/audioStorage/getContainer
 * @description Get a reference to an Azure Blob Storage container
 * @access Public
 * @param {string} req.query.containerName - Name of the container to retrieve
 * @returns {Object} - JSON object with container name or error message
 * @returns {string} [msg] - Error message if container not found or server error
 */
router.get("/getContainer", (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);

    getContainer(blobServiceClient, cleanedName)
        .then(({ containerClient, exists }) => {
            if (exists) {
                res.send({
                    containerName: cleanedName,
                });
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
router.delete("/deleteContainer", (req, res) => {
    // Validate container name
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    // Sanitize container name
    const cleanedName = sanitizeContainerName(req.query.containerName);

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
 * @description Create a new Azure Blob Storage container
 * @access Public
 * @param {string} req.body.containerName - Name for the new container
 * @returns {Object} - JSON object with success or error message
 * @returns {string} msg - Success or error message
 */
router.post("/createContainer", (req, res) => {
    // Validate container name
    if (!req.body.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    // Sanitize container name
    const cleanedName = sanitizeContainerName(req.body.containerName);

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
router.post("/uploadBlob", upload.single("file"), async (req, res) => {
    try {
        const { containerName, blobName } = req.body;
        const fileBuffer = req.file.buffer;
        // Upload fileBuffer to Azure Blob Storage
        const containerClient =
            blobServiceClient.getContainerClient(containerName);
        await containerClient.uploadBlockBlob(
            blobName,
            fileBuffer,
            fileBuffer.length
        );
        res.send({ msg: "Upload successful" });
    } catch (error) {
        console.error("Error uploading blob:", error);
        res.status(500).send({ msg: "Error uploading blob" });
    }
});

/**
 * @route POST /ravlt/transcribe
 * @description Create a transcription job using Azure Speech-to-Text API
 * @access Public
 * @param {Object} req.body - Request body matching Azure Speech-to-Text API requirements
 * @param {string} req.body.containerName - Container name of audio files to transcribe
 * @param {string} req.body.locale - Locale for transcription (e.g., "en-US")
 * @param {string} req.body.displayName - Name for the transcription job
 * @param {string} req.body.trialID - ID of the trial to update
 * @param {Object} [req.body.properties] - Optional properties for transcription
 * @returns {Object} - JSON response from Azure or error message
 */
router.post("/transcribe", async (req, res) => {
    // Create a service SAS for a blob container
    const cleanedName = sanitizeContainerName(req.body.containerName);
    const containerClient = blobServiceClient.getContainerClient(cleanedName);
    const sas = await getContainerSasUri(
        containerClient,
        sharedKeyCredential,
        null
    );
    // Send the request to Azure Speech-to-Text API
    const apiUrl = `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;
    const body = {
        contentContainerUrl: sas,
        locale: req.body.locale,
        displayName: req.body.displayName,
        model: null,
        properties: {
            wordLevelTimestampsEnabled: true,
            displayFormWordLevelTimestampsEnabled: true,
        },
    };
    // Send the request to Azure Speech-to-Text API
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    // Get the response from Azure Speech-to-Text API
    const data = await response.json();

    // Get the transcription ID - last bit of the URL
    const transcriptionId = data.self.split("/").pop();
    console.log("Extracted transcription ID:", transcriptionId);

    // Update the trial with the transcription ID if trial ID is provided
    if (req.body.trialID) {
        try {
            // Find and update the trial - use transcriptionID with uppercase ID to match schema
            const updatedTrial = await RAVLTTrial.findOneAndUpdate(
                { trialID: req.body.trialID },
                { transcriptionID: transcriptionId },
                { new: true } // Return the updated document
            );
            if (!updatedTrial) {
                console.error("Trial not found with ID:", req.body.trialID);
                return res.status(404).send({
                    msg: "Trial not found",
                    trialID: req.body.trialID,
                });
            }

            res.send({
                msg: "Transcription started",
                data: data,
                transcriptionId: transcriptionId,
                updatedTrial: updatedTrial,
            });
        } catch (error) {
            console.error("Error updating trial transcription ID:", error);
            res.status(500).send({
                msg: "Error updating trial transcription ID",
                error: error.message,
            });
        }
    } else {
        // If no trialID provided, just return transcription metadata
        res.send({
            msg: "Transcription started",
            data: data,
            transcriptionId: transcriptionId,
        });
    }
});

/**
 * @route POST /audioStorage/updateTranscriptionResults
 * @description Get the transcription files for a completed transcription job
 * @access Public
 * @param {string} req.body.trialID - ID of the trial
 * @param {string} req.body.test - Type of test (e.g., "RAVLT")
 * @returns {Object} - JSON containing the transcription files or error message
 */
router.post("/updateTranscriptionResults", async (req, res) => {
    try {
        // Get trialID from query params
        const trialID = req.body.trialID;
        console.log("Trial ID: " + trialID);
        console.log("Test: " + req.body.test);

        // Validate trialID is provided
        if (!trialID) {
            return res.status(400).json({ msg: "Trial ID is required" });
        }

        // Get transcriptionID from the database using trialID
        const trial = await RAVLTTrial.findOne({ trialID: trialID });
        if (trial.status !== "complete") {
            return res.status(400).json({ msg: "Trial is not completed" });
        }
        if (!trial || !trial.transcriptionID) {
            return res
                .status(404)
                .json({ msg: "Transcription ID not found for this trial" });
        }
        const transcriptionID = trial.transcriptionID;
        // Directly access the files endpoint for the specific transcription ID
        const filesUrl = `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions/${transcriptionID}/files`;

        const filesResponse = await fetch(filesUrl, {
            method: "GET",
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY,
                "Content-Type": "application/json",
            },
        });

        // Handle potential errors
        if (!filesResponse.ok) {
            return res.status(filesResponse.status).json({
                msg: `Error retrieving transcription files: ${filesResponse.statusText}`,
            });
        }

        const filesData = await filesResponse.json();

        if (!filesData.values || filesData.values.length === 0) {
            return res
                .status(404)
                .json({ msg: "No transcription files found" });
        }

        // Get the actual transcription content
        const transcriptionResults = [];
        for (const file of filesData.values) {
            const fileResponse = await fetch(file.links.contentUrl);
            const fileContent = await fileResponse.json();
            transcriptionResults.push({
                filename: file.name,
                content: fileContent,
            });
        }

        // Aggregate word-level timestamps, phrases, and combined phrases
        const words = [];
        const phrases = [];
        const combinedPhrases = [];
        transcriptionResults.forEach(({ content, filename }) => {
            // extract file index (from '-X.wav.json')
            const match = filename.match(/-(\d+)\.wav\.json$/);
            const fileIndex = match ? Number(match[1]) : null;
            (content.combinedRecognizedPhrases || []).forEach((p) =>
                combinedPhrases.push(p.display)
            );
            (content.recognizedPhrases || []).forEach((rp) => {
                const top = rp.nBest && rp.nBest[0];
                if (top) {
                    phrases.push(top.display);
                    (top.words || []).forEach((w) =>
                        words.push({
                            word: w.word,
                            time: w.offsetMilliseconds,
                            duration: w.durationMilliseconds,
                            confidence: w.confidence,
                            fileIndex,
                        })
                    );
                }
            });
        });
        // console.log(words);
        if (req.body.test && req.body.trialID) {
            switch (req.body.test) {
                case "RAVLT":
                    console.log("Transcribing RAVLT");
                    const transcribedWords = words;
                    RAVLTResults.findOneAndUpdate(
                        {
                            trialID: req.body.trialID,
                        },
                        { transcribedWords: transcribedWords },
                        { new: true }
                    )
                        .then((updatedTrial) => {
                            console.log("Updated trial");
                        })
                        .catch((error) => {
                            console.error("Error updating trial:", error);
                            res.status(500).json({
                                msg: "Error updating trial",
                            });
                        });
            }
        }

        res.json({ words, phrases, combinedPhrases });
    } catch (error) {
        console.error("Error retrieving transcription files:", error);
        res.status(500).json({ msg: "Error retrieving transcription files" });
    }
});

/**
 *
 * @param {ContainerClient} containerClient
 * @param {StorageSharedKeyCredential} sharedKeyCredential
 * @param {string} storedPolicyName
 * @returns {string} - SAS URL for the container
 */
const getContainerSasUri = async (
    containerClient,
    sharedKeyCredential,
    storedPolicyName
) => {
    // Create SAS token for the container
    const sasOptions = {
        containerName: containerClient.containerName,
        permissions: ContainerSASPermissions.parse("racwl"),
    };

    if (storedPolicyName == null) {
        // Set SAS token to expire in 1 hour
        sasOptions.startsOn = new Date();
        sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
    } else {
        sasOptions.identifier = storedPolicyName;
    }

    // Generate SAS token
    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
    ).toString();
    console.log(`SAS token for blob container is: ${sasToken}`);

    // Return the SAS token
    return `${containerClient.url}?${sasToken}`;
};
const getFileSasUri = async (
    containerClient,
    sharedKeyCredential,
    storedPolicyName,
    blobName
) => {
    // Create SAS token for the file
    const sasOptions = {
        containerName: containerClient.containerName,
        blobName: blobName,
        permissions: ContainerSASPermissions.parse("racw"),
    };

    if (storedPolicyName == null) {
        // Set SAS token to expire in 1 hour
        sasOptions.startsOn = new Date();
        sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
    } else {
        // Use stored policy
        sasOptions.identifier = storedPolicyName;
    }

    // Generate SAS token
    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
    ).toString();
    console.log(`SAS token for blob is: ${sasToken}`);

    // Return the SAS token + url
    return `${containerClient.url}?${sasToken}`;
};

/**
 * @route GET /api/audioStorage/getTranscriptionStatus
 * @description Get transcription status for a specific container
 * @access Public
 * @param {string} req.query.transcriptionId - ID of the transcription job
 * @returns {Object} - JSON containing the transcription status or error message
 */
router.get("/RAVLT/getTranscriptionStatus", async (req, res) => {
    try {
        const transcriptionId = req.query.transcriptionId;
        // Get all transcriptions
        const apiUrl = `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY,
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();

        // Find the transcription for this container
        const transcription = data.values?.find(
            (t) => t.id === transcriptionId
        );

        if (!transcription) {
            return res
                .status(404)
                .json({ msg: "No transcription found for this container" });
        }

        res.json(transcription);
    } catch (error) {
        console.error("Error getting transcription status:", error);
        res.status(500).json({ msg: "Error getting transcription status" });
    }
});

/**
 * @route GET /api/audioStorage/getContainerFileURLs
 * @description Get the file URLs for a specific container
 * @access Public
 * @param {string} req.query.containerName - Name of the container
 * @returns {Object} - JSON containing the file URLs or error message
 */
router.get("/getContainerFileURLs", async (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);

    getContainer(blobServiceClient, cleanedName)
        .then(async ({ containerClient, exists }) => {
            if (exists) {
                const urls = [];
                for await (const response of containerClient
                    .listBlobsFlat()
                    .byPage({ maxPageSize: 10 })) {
                    console.log("- Page:");
                    if (response.segment.blobItems) {
                        for (const blob of response.segment.blobItems) {
                            console.log(`  - ${blob.name}`);
                            urls.push({
                                blobName: blob.name,
                                url: await getFileSasUri(
                                    containerClient,
                                    sharedKeyCredential,
                                    null,
                                    blob.name
                                ),
                            });
                        }
                    }
                }
                res.send({
                    containerName: cleanedName,
                    urls: urls,
                });
            } else {
                res.send({ msg: "Container not found" });
            }
        })
        .catch((error) => {
            console.error("Error getting container:", error);
            res.status(500).send({ msg: "Error getting container" });
        });
});

export default router;
export { createContainer };
