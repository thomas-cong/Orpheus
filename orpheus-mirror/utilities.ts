// ex: formatParams({ some_key: "some_value", a: "b"}) => "some_key=some_value&a=b"
function formatParams(params: Record<string, any>): string {
    // iterate of all the keys of params as an array,
    // map it to a new array of URL string encoded key,value pairs
    // join all the url params using an ampersand (&).
    return Object.keys(params)
        .map((key) => key + "=" + encodeURIComponent(params[key]))
        .join("&");
}
/**
 * Converts a string to a deterministic number by hashing
 * @param {string} inputString - The input string to encode
 * @returns {number} - A deterministic number representation of the string
 */
function stringToNumber(inputString: string): number {
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
}
// convert a fetch result to a JSON object with error handling for fetch and json errors
function convertToJSON(res: Response): Promise<any> {
    if (!res.ok) {
        throw `API request failed with response status ${res.status} and text: ${res.statusText}`;
    }

    return res
        .clone() // clone so that the original is still readable for debugging
        .json() // start converting to JSON object
        .catch(() => {
            // throw an error containing the text that couldn't be converted to JSON
            return res.text().then((text) => {
                throw `API request's result could not be converted to a JSON object: \n${text}`;
            });
        });
}

// Helper code to make a get request. Default parameter of empty JSON Object for params.
// Returns a Promise to a JSON Object.
export function get(
    endpoint: string,
    params: Record<string, any> = {}
): Promise<any> {
    const fullPath = endpoint + "?" + formatParams(params);
    return fetch(fullPath)
        .then(convertToJSON)
        .catch((error) => {
            // give a useful error message
            throw `GET request to ${fullPath} failed with error:\n${error}`;
        });
}

// Helper code to make a post request. Default parameter of empty JSON Object for params.
// Returns a Promise to a JSON Object.
export function post(
    endpoint: string,
    params: Record<string, any> | FormData = {}
): Promise<any> {
    // Different handling based on params type
    const options: RequestInit = {
        method: "post",
    };

    // If it's FormData, don't set Content-Type (browser will set it with boundary)
    if (params instanceof FormData) {
        options.body = params;
    } else {
        options.headers = { "Content-type": "application/json" };
        options.body = JSON.stringify(params);
    }

    return fetch(endpoint, options)
        .then(convertToJSON)
        .catch((error) => {
            throw `POST request to ${endpoint} failed with error:\n${error}`;
        });
}

// Remove the incorrect export default utilities; line
// Instead, create a utilities object if you want to export it as default
// Trial Management API
export const createTrial = (trialType: "RO" | "RAVLT") =>
    post("/api/trials/createTrial", { trialType });

export const updateTrial = (data: {
    trialType: "RO" | "RAVLT";
    trialID: string;
    patientID: string;
    date?: Date;
    status?: string;
}) => post("/api/trials/updateTrial", data);

export const addResults = (data: {
    trialType: "RO" | "RAVLT";
    trialID: string;
    patientID: string;
    [key: string]: any;
}) => post("/api/trials/addResults", data);

export const getTrial = (trialID: string) =>
    get("/api/trials/getTrialByTrialID", { trialID });

export const getResults = (trialID: string) =>
    get("/api/trials/getResultsByTrialID", { trialID });

const utilities = {
    get,
    post,
    stringToNumber,
    createTrial,
    updateTrial,
    addResults,
    getTrial,
    getResults,
};
export default utilities;
