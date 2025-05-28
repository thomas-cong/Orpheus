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
            if (!patientID || !trialID) return;
            setLoading(true);
            setError("");
            console.log(patientID, trialID);
            try {
                // 1. Fetch all trials for this patient and find the matching one
                const trialsResp = await get("/api/trials/getTrials", {
                    patientID: patientID,
                });
                const trials = trialsResp.trials || [];
                const trial = trials.find((t: any) => t.trialID === trialID);
                console.log(trialsResp);
                if (!trial) {
                    console.log("Trial not found");
                    return;
                }
                const transcriptionID = trial.transcriptionID;
                if (!transcriptionID) {
                    console.log("No transcription ID for trial");
                    return;
                }

                // 2. Fetch transcription files
                const transFilesResp = await get(
                    "/api/audioStorage/getTranscriptionFiles",
                    {
                        transcriptionID: transcriptionID,
                        patientID: patientID,
                        trialID: trialID,
                        test: "RAVLT",
                    }
                );
                console.log(transFilesResp);
                // 3. Calculate RAVLT results
                const ravltResp = await post(
                    "/api/analytics/calculateRAVLTResults",
                    {
                        patientID: patientID,
                        trialID: trialID,
                    }
                );
                console.log(ravltResp);
                setResultText(JSON.stringify(ravltResp, null, 2));
            } catch (e) {
                console.error(e);
                setError(e.message);
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
