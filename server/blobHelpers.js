import { BlobServiceClient } from "@azure/storage-blob";
import { StorageSharedKeyCredential } from "@azure/storage-blob";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { generateBlobSASQueryParameters } from "@azure/storage-blob";
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
/**
 * Downloads a blob from Azure Blob Storage to a local file
 * @param {string} connectionString - Azure Blob Storage connection string
 * @param {string} containerName - Name of the container
 * @param {string} blobName - Name of the blob
 * @param {string} downloadFilePath - Local path to save the blob
 */
async function downloadBlobToFile(
    connectionString,
    containerName,
    blobName,
    downloadFilePath
) {
    const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.downloadToFile(downloadFilePath);
    return downloadFilePath;
}

/**
 * Lists all blobs in a given container
 * @param {string} connectionString - Azure Blob Storage connection string
 * @param {string} containerName - Name of the container
 * @returns {Promise<string[]>} - Array of blob names
 */
async function listBlobsInContainer(connectionString, containerName) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobNames = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        blobNames.push(blob.name);
    }
    return blobNames;
}

export { getContainer, deleteContainer, createContainer, downloadBlobToFile, listBlobsInContainer };
