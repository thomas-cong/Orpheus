import React, { useState, useEffect } from "react";
import RAVLTResultsViewer from "./RAVLTResultsViewer";
import { post, get } from "../../global-files/utilities";

const OperationPanel = ({
    patientID,
    trialID,
    focused,
}: {
    patientID: string;
    trialID: string;
    focused: boolean;
}) => {
    const [showResults, setShowResults] = useState(false);
    const [computing, setComputing] = useState(false);
    const [computeStatus, setComputeStatus] = useState<string>("");
    const [trialStatus, setTrialStatus] = useState<string>("");
    const [isTrialComplete, setIsTrialComplete] = useState(false);
    const [trialType, setTrialType] = useState<string>("");

    // Fetch trial status whenever trialID changes
    useEffect(() => {
        setShowResults(false);

        if (trialID) {
            setTrialType(trialID.split("-")[0]);
            const trialType = trialID.split("-")[0];
            get(`/api/${trialType.toLowerCase()}/getTrialByTrialID`, {
                trialID,
            })
                .then((res) => {
                    if (res.trial) {
                        setTrialStatus(res.trial.status || "");
                        setIsTrialComplete(res.trial.status === "complete");
                    }
                })
                .catch((err) => {
                    console.error("Error fetching trial:", err);
                });
        }
    }, [patientID, trialID]);

    const computeResults = async () => {
        if (!trialID) return;

        try {
            setComputing(true);
            setComputeStatus("Computing transcription results...");
            // First update transcription results
            const transcriptionResponse = await post(
                "/api/audioStorage/updateTranscriptionResults",
                {
                    trialID: trialID,
                    test: trialType,
                }
            );

            setTimeout(() => {
                setComputeStatus("Computing RAVLT scores...");
            }, 2000);

            // // Then calculate the results
            const resultsResponse = await post(
                `/api/${trialType.toLowerCase()}/calculateResults`,
                {
                    trialID: trialID,
                }
            );

            setComputeStatus("Computation complete!");
            setTimeout(() => {
                setComputeStatus("");
                setComputing(false);
                // Show results after computation
                setShowResults(true);
            }, 2000);
        } catch (error) {
            console.error("Error computing results:", error);
            setComputeStatus("Error computing results. Please try again.");
            setTimeout(() => {
                setComputeStatus("");
                setComputing(false);
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
                                console.log(patientID, trialID);
                            }}
                            className="button"
                        >
                            Show RAVLT Results
                        </button>

                        <button
                            onClick={computeResults}
                            disabled={computing || !isTrialComplete}
                            className={`${
                                computing || !isTrialComplete
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            } text-white font-semibold py-2 px-4 rounded transition duration-300`}
                            title={
                                !isTrialComplete
                                    ? "Only complete trials can be computed"
                                    : ""
                            }
                        >
                            {computing
                                ? "Computing..."
                                : "Compute RAVLT Results"}
                        </button>
                    </div>

                    {computeStatus && (
                        <div className="text-sm text-blue-400 animate-pulse">
                            {computeStatus}
                        </div>
                    )}
                </div>
            )}

            {showResults && (
                <RAVLTResultsViewer patientID={patientID} trialID={trialID} />
            )}
        </div>
    );
};
export default OperationPanel;
