import { BlobServiceClient } from "@azure/storage-blob";
import { StorageSharedKeyCredential } from "@azure/storage-blob";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { generateBlobSASQueryParameters } from "@azure/storage-blob";
import { sanitizeContainerName } from "../helperfunctions.js";
/**
 * Helper to get a container client and check if it exists
 * @param {BlobServiceClient} blobServiceClient - Azure Blob Service client
 * @param {string} containerName - Name of the container
 * @returns {Object} - Container client and existence flag
 */
async function getContainer(blobServiceClient, containerName) {
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
export { getContainer, deleteContainer, createContainer };
