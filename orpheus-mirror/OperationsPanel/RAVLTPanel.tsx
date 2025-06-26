import React, { useState, useEffect, useRef } from "react";
import RAVLTResultsViewer, { RAVLTResultsViewerHandle } from "./RAVLTResultsViewer";
import { post, get } from "../../global-files/utilities";

interface RAVLTPanelProps {
    patientID: string;
    trialID: string;
    focused: boolean;
}

const RAVLTPanel: React.FC<RAVLTPanelProps> = ({ patientID, trialID, focused }) => {
    const [showResults, setShowResults] = useState(false);
    const [computing, setComputing] = useState(false);
    const [computeStatus, setComputeStatus] = useState<string>("");
    const [isTrialComplete, setIsTrialComplete] = useState(false);
    const resultsViewerRef = useRef<RAVLTResultsViewerHandle>(null);

    // Check trial completion whenever patient or trial changes
    useEffect(() => {
        setShowResults(false);
        if (!trialID) return;

        const trialType = trialID.split("-")[0];
        get(`/api/${trialType.toLowerCase()}/getTrialByTrialID`, { trialID })
            .then((res) => {
                if (res.trial) {
                    setIsTrialComplete(res.trial.status === "complete");
                }
            })
            .catch((err) => console.error("Error fetching trial:", err));
    }, [patientID, trialID]);

    const computeResults = async () => {
        if (!trialID) return;
        const trialType = trialID.split("-")[0].toLowerCase();
        try {
            setComputing(true);
            setComputeStatus("Computing transcription results...");

            // 1) Update transcription results
            let transcriptionSuccessful = true;
            try {
                await post("/api/audioStorage/updateTranscriptionResults", {
                    trialID,
                    test: trialType,
                });
            } catch (err) {
                console.error("Transcription update failed:", err);
                transcriptionSuccessful = false;
            }

            if (!transcriptionSuccessful) {
                setComputeStatus("Transcription not ready yet. Please try again later.");
                setComputing(false);
                return;
            }

            setComputeStatus("Computing RAVLT scores...");

            // 2) Calculate RAVLT scores
            await post(`/api/${trialType}/calculateResults`, { trialID });

            setComputeStatus("Computation complete!");
            setComputing(false);
            setShowResults(true);
            resultsViewerRef.current?.fetchResults();
            setTimeout(() => setComputeStatus(""), 2000);
        } catch (error) {
            console.error("Error computing results:", error);
            setComputeStatus("Error computing results. Please try again.");
            setTimeout(() => {
                setComputeStatus("");
                setComputing(false);
                setShowResults(true);
            }, 3000);
        }
    };

    return (
        <div className="space-y-4">
            {focused && (
                <div className="flex flex-col space-y-3">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                setShowResults(true);
                            }}
                            className="button"
                        >
                            Show RAVLT Results
                        </button>

                        <button
                            onClick={computeResults}
                            disabled={computing || !isTrialComplete}
                            className={`${computing || !isTrialComplete ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white font-semibold py-2 px-4 rounded transition duration-300`}
                            title={!isTrialComplete ? "Only complete trials can be computed" : ""}
                        >
                            {computing ? "Computing..." : "Compute RAVLT Results"}
                        </button>
                    </div>

                    {computeStatus && <div className="text-sm text-blue-400 animate-pulse">{computeStatus}</div>}
                </div>
            )}

            {showResults && (
                <RAVLTResultsViewer
                    ref={resultsViewerRef}
                    patientID={patientID}
                    trialID={trialID}
                />
            )}
        </div>
    );
};

export default RAVLTPanel;
