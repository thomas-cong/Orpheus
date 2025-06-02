import { useState, useEffect } from "react";
import React from "react";
import { get } from "../../global-files/utilities";

const TrialList = (props: {
    patientID: string;
    setFocusedContainerName: (containerName: string) => void;
    setFocusedTrialID: (trialID: string) => void;
    setFocusedPatientID: (patientID: string) => void;
    setFocused: (focused: boolean) => void;
    focusedTrialID: string;
}) => {
    // State variables for trials and expanded IDs
    const [trials, setTrials] = useState([]);
    const [expandedIds, setExpandedIds] = useState<{ [key: string]: boolean }>({});
    // const [focusedTrialID, setFocusedTrialID] = useState<string>("");
    // Whenever different patient selected, get trials for the patient
    useEffect(() => {
        if (!props.patientID) return;
        get(`/api/trials/getTrialsByPatientID`, { patientID: props.patientID })
            .then((res) => {
                if (res.trials) {
                    setTrials(res.trials);
                    // // Set the first trial as the focused container
                    // props.setFocusedContainerName(
                    //     props.patientID + "-" + res.trials[0].trialID
                    // );
                    // props.setFocusedPatientID(props.patientID);
                    // props.setFocusedTrialID(res.trials[0].trialID);
                    // props.setFocused(true);
                    // console.log(props.patientID + "-" + res.trials[0].trialID);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [props.patientID]);
    // Render the trials
    const renderTrials = () => {
        // Map over the trials and return a list of trial cards
        return trials.map((trial: any) => (
            <div
                key={trial.trialID}
                className={`flex flex-col w-full px-4 py-2 ${props.focusedTrialID === trial.trialID ? 'bg-gray-600 border-blue-500' : 'bg-gray-800 border-gray-700'} border-2 shadow-md mb-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer`}
                onClick={() => {
                    // Set the focused container name when clicked
                    props.setFocusedContainerName(
                        props.patientID + "-" + trial.trialID
                    );
                    props.setFocusedPatientID(props.patientID);
                    props.setFocusedTrialID(trial.trialID);
                    console.log(props.patientID + "-" + trial.trialID);
                    props.setFocused(true);
                }}
            >
                {/* Some Display Content */}
                <div className="flex flex-row items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-blue-300">
                        {trial.test}
                    </h3>
                    <span className="text-gray-400 text-xs">
                        {trial.trialID}
                    </span>
                </div>
                <div className="flex flex-row justify-between">
                    <span className="text-gray-400 mr-2">
                        Date: {new Date(trial.date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-400 flex items-center">
                        Transcription ID:{" "}
                        {trial.transcriptionID ? (
                            <span className="ml-1 flex items-center">
                                {expandedIds[trial.trialID] ? (
                                    <span
                                        className="text-xs font-mono bg-gray-700 px-1 py-0.5 rounded cursor-pointer"
                                        onClick={(e) => {
                                            // Stop event propagation
                                            e.stopPropagation();
                                            // Toggle expanded state
                                            setExpandedIds({
                                                ...expandedIds,
                                                [trial.trialID]: false,
                                            });
                                        }}
                                    >
                                        {trial.transcriptionID}
                                    </span>
                                ) : (
                                    <span
                                        className="text-xs bg-gray-700 px-1 py-0.5 rounded cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedIds({
                                                ...expandedIds,
                                                [trial.trialID]: true,
                                            });
                                        }}
                                    >
                                        ...
                                    </span>
                                )}
                            </span>
                        ) : (
                            "None"
                        )}
                    </span>
                </div>
            </div>
        ));
    };

    return (
        <div className="flex flex-col w-full px-4 py-2 bg-gray-800 border border-gray-700 shadow-md rounded-lg m-2 h-96">
            <h2 className="text-lg font-bold mb-2 text-blue-400">Trial List</h2>
            <div className="overflow-y-auto">
                {trials && trials.length > 0 ? (
                    renderTrials()
                ) : (
                    <p className="text-gray-400">
                        {props.patientID
                            ? "No trials found for this patient."
                            : "Select a patient to view their trials."}
                    </p>
                )}
            </div>
        </div>
    );
};
export default TrialList;
