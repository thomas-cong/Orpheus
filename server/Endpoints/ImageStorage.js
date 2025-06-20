import express from "express";
import { BlobServiceClient } from "@azure/storage-blob";
import { StorageSharedKeyCredential } from "@azure/storage-blob";
import dotenv from "dotenv";
import multer from "multer";
import {
    getContainer,
    deleteContainer,
    createContainer,
} from "../blobHelpers.js";

// Load environment variables
dotenv.config();

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
    process.env.STORAGE_CONNECTION_STRING
);
const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.STORAGE_ACCOUNT_NAME,
    process.env.STORAGE_KEY
);
