import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { get, post } from "../global-files/utilities";

// List of common endpoints for suggestions
const COMMON_ENDPOINTS = [
    "/api/patients/genPatientID",
    "/api/patients/getPatient",
    "/api/patients/addPatient",
    "/api/trials/genTrialID",
    "/api/trials/addTrial",
    "/api/trials/getTrials",
    "/api/admin/generateTestingTrial",
    "/api/audioStorage/getContainer",
    "/api/audioStorage/createContainer",
    "/api/audioStorage/uploadBlob",
    "/api/audioStorage/getContainerFileURLs",
];

const Testing = () => {
    // API testing state
    const [endpointUrl, setEndpointUrl] = useState(
        "/api/patients/genPatientID"
    );
    const [method, setMethod] = useState("GET");
    const [paramsInput, setParamsInput] = useState("{}");
    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] =
        useState(COMMON_ENDPOINTS);

    // Filter suggestions based on input
    useEffect(() => {
        // Ensure endpointUrl is a string before calling trim()
        const urlString = String(endpointUrl || "");
        if (urlString.trim() === "") {
            setFilteredSuggestions(COMMON_ENDPOINTS);
        } else {
            const filtered = COMMON_ENDPOINTS.filter((endpoint) =>
                endpoint.toLowerCase().includes(urlString.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        }
    }, [endpointUrl]);

    // Function to call the selected API endpoint
    const callApiEndpoint = async () => {
        setIsLoading(true);
        setError(null);
        setApiResponse(null);

        try {
            let params = {};
            try {
                params = JSON.parse(paramsInput);
            } catch (e) {
                throw new Error("Invalid JSON parameters");
            }

            let response: any;
            if (method === "GET") {
                // Use the utilities.get function for GET requests
                console.log("GET request:", endpointUrl, params);
                response = await get(endpointUrl, params);
            } else {
                // Use the utilities.post function for POST requests
                console.log("POST request:", endpointUrl, params);
                response = await post(endpointUrl, params);
            }

            setApiResponse(response);
        } catch (err) {
            setError(err.message || "An error occurred");
            console.error("API call error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-400">
                        Testing Dashboard
                    </h1>
                    <Link
                        to="/portal"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition duration-200"
                    >
                        Back to Patient Portal
                    </Link>
                </div>

                {/* API Testing Interface */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-purple-400">
                        API Endpoint Tester
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    API Endpoint URL
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={endpointUrl}
                                        onChange={(e) =>
                                            setEndpointUrl(e.target.value)
                                        }
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() =>
                                            setTimeout(
                                                () => setShowSuggestions(false),
                                                200
                                            )
                                        }
                                        placeholder="/api/endpoint/path"
                                    />
                                    {showSuggestions &&
                                        filteredSuggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                                {filteredSuggestions.map(
                                                    (suggestion, index) => (
                                                        <div
                                                            key={index}
                                                            className="px-3 py-2 hover:bg-gray-600 cursor-pointer text-sm"
                                                            onClick={() => {
                                                                setEndpointUrl(
                                                                    suggestion
                                                                );
                                                                setShowSuggestions(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    HTTP Method
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-600"
                                            name="method"
                                            value="GET"
                                            checked={method === "GET"}
                                            onChange={() => setMethod("GET")}
                                        />
                                        <span className="ml-2 text-white">
                                            GET
                                        </span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-600"
                                            name="method"
                                            value="POST"
                                            checked={method === "POST"}
                                            onChange={() => setMethod("POST")}
                                        />
                                        <span className="ml-2 text-white">
                                            POST
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Parameters (JSON)
                            </label>
                            <textarea
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono h-32"
                                value={paramsInput}
                                onChange={(e) => setParamsInput(e.target.value)}
                                placeholder='{"key": "value"}'
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition duration-200 disabled:opacity-50"
                            onClick={callApiEndpoint}
                            disabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Execute API Call"}
                        </button>
                    </div>

                    {/* API Response Display */}
                    {(apiResponse || error) && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2 text-gray-300">
                                Response
                            </h3>

                            {error && (
                                <div className="bg-red-900 border border-red-700 rounded-md p-3 text-red-200 font-mono whitespace-pre-wrap">
                                    Error: {error}
                                </div>
                            )}

                            {apiResponse && (
                                <div className="bg-gray-700 border border-gray-600 rounded-md p-3 font-mono text-green-300 whitespace-pre-wrap overflow-auto max-h-80">
                                    {JSON.stringify(apiResponse, null, 2)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Testing;
