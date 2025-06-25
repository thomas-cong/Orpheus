/**
 * Converts a string to a deterministic number by hashing
 * @param {string} inputString - The input string to encode
 * @returns {number} - A deterministic number representation of the string
 */
const stringToNumber = (inputString) => {
    // Strip and trim the string
    const cleanedString = inputString.trim().replace(/\s+/g, "");

    // Use a simple hash function for deterministic encoding
    let hash = 0;

    // Return 0 for empty strings
    if (cleanedString.length === 0) return hash;

    // Calculate hash value using character codes
    for (let i = 0; i < cleanedString.length; i++) {
        const char = cleanedString.charCodeAt(i);
        // Multiply by 31 (common in hash functions) and add the character code
        hash = (hash << 5) - hash + char;
        // Convert to 32-bit integer
        hash = hash & hash;
    }

    // Ensure the result is positive
    return Math.abs(hash);
};
const sanitizeContainerName = (name) => {
    // Convert to lowercase (Azure requirement)
    let sanitized = name.toLowerCase();

    return sanitized;
};

/**
 * Generates a random alphanumeric sequence of specified length
 * @param {number} length - The length of the sequence to generate
 * @returns {string} - A random alphanumeric sequence
 */
import OpenAI from "openai";

let openaiClient = null;

/**
 * Lazily initializes and returns a singleton OpenAI client instance.
 * This ensures the API key is loaded from .env before the client is created.
 * @returns {OpenAI} The OpenAI client instance.
 */
function getOpenAIClient() {
    if (!openaiClient) {
        if (!process.env.OPENAI_API_KEY) {
            // This check provides a clearer error message if the key is still missing at runtime.
            throw new Error(
                "The OPENAI_API_KEY environment variable is missing or empty."
            );
        }
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

/**
 * Generates an embedding for the given text using OpenAI's API.
 * @param {string} text The text to embed.
 * @param {string} model The model to use for embedding.
 * @returns {Promise<number[]|null>} The embedding vector or null if an error occurs.
 */
async function getEmbedding(text, model = "text-embedding-3-small") {
    if (!text || typeof text !== "string" || text.trim() === "") {
        // Return a zero-vector or handle as an error, depending on desired behavior.
        // For similarity, returning null might be safer to avoid incorrect calculations.
        return null;
    }
    try {
        const client = getOpenAIClient();
        const response = await client.embeddings.create({
            input: [text],
            model: model,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error(
            `Error getting embedding for text "${text}": ${error.message}`
        );
        return null;
    }
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vec1 The first vector.
 * @param {number[]} vec2 The second vector.
 * @returns {number} The cosine similarity score.
 */
function cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2) return 0;
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    const normVec1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const normVec2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));

    if (normVec1 === 0 || normVec2 === 0) {
        return 0.0;
    }

    return dotProduct / (normVec1 * normVec2);
}

/**
 * Generates a random alphanumeric sequence of specified length
 * @param {number} length - The length of the sequence to generate
 * @returns {string} - A random alphanumeric sequence
 */
const generateAlphanumericSequence = (length) => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
};

export {
    stringToNumber,
    sanitizeContainerName,
    generateAlphanumericSequence,
    getEmbedding,
    cosineSimilarity,
};
