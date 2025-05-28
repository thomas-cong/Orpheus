import React, { useState, useEffect } from "react";
import RAVLTResultsViewer from "./RAVLTResultsViewer";

const OperationPanel = ({
    patientID,
    trialID,
}: {
    patientID: string;
    trialID: string;
}) => {
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setShowResults(false);
    }, [patientID, trialID]);

    return (
        <div>
            <button
                onClick={() => {
                    setShowResults(true);
                    console.log(patientID, trialID);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
                Show RAVLT Results
            </button>
            {showResults && (
                <RAVLTResultsViewer patientID={patientID} trialID={trialID} />
            )}
        </div>
    );
};
export default OperationPanel;
