import express from "express";
import { BlobServiceClient } from "@azure/storage-blob";
import { StorageSharedKeyCredential } from "@azure/storage-blob";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { generateBlobSASQueryParameters } from "@azure/storage-blob";
import { sanitizeContainerName } from "../helperfunctions.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

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
 * Helper to get a container client and check if it exists
 * @param {string} containerName - Name of the container
 * @returns {Object} - Container client and existence flag
 */
async function getContainer(containerName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    return { containerClient, exists };
}

/**
 * Helper to delete a container
 * @param {BlobServiceClient} blobServiceClient - Azure Blob Service client
 * @param {string} containerName - Name of the container to delete
 */
async function deleteContainer(blobServiceClient, containerName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.delete();
}

/**
 * Helper to create a container
 * @param {BlobServiceClient} blobServiceClient - Azure Blob Service client
 * @param {string} containerName - Name of the container to create
 * @returns {ContainerClient} - The created container client
 */
async function createContainer(blobServiceClient, containerName) {
    const containerClient = await blobServiceClient.createContainer(
        containerName
    );
    return containerClient;
}

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

    getContainer(cleanedName)
        .then(({ containerClient, exists }) => {
            if (exists) {
                res.send({
                    containerName: cleanedName,
                    containerClient: containerClient,
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
router.post("/uploadBlob", async (req, res) => {
    if (!req.body.containerName || !req.body.blobName || !req.body.data) {
        return res.status(400).send({ msg: "Missing required fields" });
    }

    const cleanedName = sanitizeContainerName(req.body.containerName);

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
    const sasOptions = {
        containerName: containerClient.containerName,
        permissions: ContainerSASPermissions.parse("racwl"),
    };

    if (storedPolicyName == null) {
        sasOptions.startsOn = new Date();
        sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
    } else {
        sasOptions.identifier = storedPolicyName;
    }

    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
    ).toString();
    console.log(`SAS token for blob container is: ${sasToken}`);

    return `${containerClient.url}?${sasToken}`;
};
const getFileSasUri = async (
    containerClient,
    sharedKeyCredential,
    storedPolicyName,
    blobName
) => {
    const sasOptions = {
        containerName: containerClient.containerName,
        blobName: blobName,
        permissions: ContainerSASPermissions.parse("racwl"),
    };

    if (storedPolicyName == null) {
        sasOptions.startsOn = new Date();
        sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
    } else {
        sasOptions.identifier = storedPolicyName;
    }

    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
    ).toString();
    console.log(`SAS token for blob is: ${sasToken}`);

    return `${containerClient.url}?${sasToken}`;
};
/**
 * @route POST /api/audioStorage/transcribe
 * @description Create a transcription job using Azure Speech-to-Text API
 * @access Public
 * @param {Object} req.body - Request body matching Azure Speech-to-Text API requirements
 * @param {Array} req.body.containerName - Container name of audio files to transcribe
 * @param {string} req.body.locale - Locale for transcription (e.g., "en-US")
 * @param {string} req.body.displayName - Name for the transcription job
 * @param {Object} [req.body.properties] - Optional properties for transcription
 * @returns {Object} - JSON response from Azure or error message
 */
router.post("/transcribe", async (req, res) => {
    // Create a service SAS for a blob container
    const containerClient = blobServiceClient.getContainerClient(
        req.body.containerName
    );
    const sas = await getContainerSasUri(
        containerClient,
        sharedKeyCredential,
        null
    );
    console.log("SAS", sas);
    const apiUrl = `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;
    const body = {
        contentContainerUrl: sas,
        locale: req.body.locale,
        displayName: req.body.displayName,
        model: null,
    };

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    res.send({ msg: "Transcription started", data: data });
});
/**
 * @route GET /api/audioStorage/getTranscriptionStatus
 * @description Get the status of a transcription job
 * @access Public
 * @param {string} req.query.transcriptionId - ID of the transcription job
 * @returns {Object} - JSON response from Azure or error message
 */
router.get("/getTranscriptionStatus", async (req, res) => {
    try {
        const apiUrl = `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions/${req.query.transcriptionId}`;
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY,
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error("Error getting transcription status:", error);
        res.status(500).send({ msg: "Error getting transcription status" });
    }
});
/**
 * @route GET /api/audioStorage/getContainerFileURLs
 * @description Get the URLs of files in a container
 * @access Public
 * @param {string} req.query.containerName - Name of the container
 * @returns {Object} - JSON object with container name or error message
 * @returns {string} [msg] - Error message if container not found or server error
 */
router.get("/getContainerFileURLs", async (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);

    getContainer(cleanedName)
        .then(({ containerClient, exists }) => {
            if (exists) {
                const blobList = containerClient.listBlobsFlat();
                console.log("blobList", blobList);
                const urls = [];
                for (const blob of blobList) {
                    getFileSasUri(
                        containerClient,
                        sharedKeyCredential,
                        null,
                        blob.name
                    ).then((url) => {
                        urls.push({
                            blobName: blob.name,
                            url: url,
                        });
                    });
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
