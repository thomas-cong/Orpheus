import dotenv from "dotenv";
// Load environment variables
dotenv.config();
import express from "express";
import { BlobServiceClient } from "@azure/storage-blob";
import { StorageSharedKeyCredential } from "@azure/storage-blob";

import {
    ContainerSASPermissions,
    generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { sanitizeContainerName } from "../helperfunctions.js";
import multer from "multer";
import {
    getContainer,
    deleteContainer,
    createContainer,
} from "../blobHelpers.js";

const router = express.Router();

// Configure multer for memory storage (files stored in memory before processing)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Initialize Azure Blob Service client
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.IMAGE_STORAGE_CONNECTION_STRING
);
const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.IMAGE_STORAGE_ACCOUNT_NAME,
    process.env.IMAGE_STORAGE_KEY
);

/**
 * @route GET /api/imageStorage/getContainer
 * @description Get a reference to an Azure Blob Storage container
 */
router.get("/getContainer", (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);

    getContainer(blobServiceClient, cleanedName)
        .then(({ exists }) => {
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
 * @route DELETE /api/imageStorage/deleteContainer
 * @description Delete an Azure Blob Storage container
 */
router.delete("/deleteContainer", (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);

    deleteContainer(blobServiceClient, cleanedName)
        .then(() => res.send({ msg: "Container deleted" }))
        .catch((error) => {
            console.error("Error deleting container:", error);
            res.status(500).send({ msg: "Error deleting container" });
        });
});

/**
 * @route POST /api/imageStorage/createContainer
 * @description Create a new Azure Blob Storage container
 */
router.post("/createContainer", (req, res) => {
    if (!req.body.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.body.containerName);

    createContainer(blobServiceClient, cleanedName)
        .then(() =>
            res.send({ msg: "Container created", containerName: cleanedName })
        )
        .catch((error) => {
            console.error("Error creating container:", error);
            res.status(500).send({ msg: "Error creating container" });
        });
});

/**
 * @route POST /api/imageStorage/uploadBlob
 * @description Upload an image blob to Azure Blob Storage
 */
router.post("/uploadBlob", upload.single("file"), async (req, res) => {
    try {
        const { containerName, blobName } = req.body;
        const fileBuffer = req.file.buffer;
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

// Helper to get a SAS URL for an individual blob
const getFileSasUri = async (
    containerClient,
    sharedKeyCredential,
    storedPolicyName,
    blobName
) => {
    const sasOptions = {
        containerName: containerClient.containerName,
        blobName: blobName,
        permissions: ContainerSASPermissions.parse("racw"),
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
    const blobClient = containerClient.getBlobClient(blobName);
    return `${blobClient.url}?${sasToken}`;
};

/**
 * @route GET /api/imageStorage/getContainerFileURLs
 * @description List blobs in a container and return SAS URLs
 */
router.get("/getContainerFileURLs", async (req, res) => {
    if (!req.query.containerName) {
        return res.status(400).send({ msg: "Container name is required" });
    }
    const cleanedName = sanitizeContainerName(req.query.containerName);

    getContainer(blobServiceClient, cleanedName)
        .then(async ({ containerClient, exists }) => {
            if (!exists) {
                return res.send({ msg: "Container not found" });
            }
            const urls = [];
            for await (const response of containerClient
                .listBlobsFlat()
                .byPage({ maxPageSize: 10 })) {
                if (response.segment.blobItems) {
                    for (const blob of response.segment.blobItems) {
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
            res.send({ containerName: cleanedName, urls });
        })
        .catch((error) => {
            console.error("Error getting container:", error);
            res.status(500).send({ msg: "Error getting container" });
        });
});

export default router;
export { createContainer };
