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
const generateAlphanumericSequence = (length) => {
    const characters =
        "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
};

export { stringToNumber, sanitizeContainerName, generateAlphanumericSequence };
