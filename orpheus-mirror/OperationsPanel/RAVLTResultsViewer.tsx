import React, { useState, useEffect } from "react";
import { get, post } from "../../global-files/utilities";

const RAVLTResultsViewer = ({
    patientID,
    trialID,
}: {
    patientID: string;
    trialID: string;
}) => {
    const [resultText, setResultText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResults = async () => {
            if (!trialID) return;
            setLoading(true);
            setError("");
            console.log("Fetching results for trial ID:", trialID);
            try {
                // Get trial details to verify it exists
                const trialResp = await get("/api/ravlt/getTrialByTrialID", {
                    trialID: trialID,
                });

                if (!trialResp.trial) {
                    console.log("Trial not found");
                    setError("Trial not found");
                    return;
                }

                // Fetch RAVLT results using the new endpoint
                const resultsResp = await get(
                    "/api/ravlt/getResultsByTrialID",
                    {
                        trialID: trialID,
                    }
                );

                if (!resultsResp) {
                    console.log("No results found for this trial");
                    setResultText(
                        "No RAVLT results found for this trial. Try computing results first."
                    );
                } else {
                    console.log("Results found:", resultsResp);
                    setResultText(JSON.stringify(resultsResp, null, 2));
                }
            } catch (e) {
                console.error(e);
                setError(e.message || "Error fetching results");
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [patientID, trialID]);

    if (loading)
        return (
            <p className="text-gray-300">Loading transcription & analysis...</p>
        );
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <textarea
            className="w-full h-64 bg-gray-800 text-gray-300 p-3 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            value={resultText}
            readOnly
        />
    );
};

export default RAVLTResultsViewer;
