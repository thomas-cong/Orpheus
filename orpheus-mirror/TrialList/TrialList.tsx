import { useState, useEffect } from "react";
import React from "react";
import { get } from "../../global-files/utilities";

const TrialList = (props: { patientID: string }) => {
    const [trials, setTrials] = useState([]);
    useEffect(() => {
        if (!props.patientID) return;
        get(`/api/trials/getTrials`, { patientID: props.patientID })
            .then((res) => {
                if (res.trials) {
                    setTrials(res.trials);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [props.patientID]);
    const renderTrials = () => {
        return trials.map((trial: any) => (
            <div
                key={trial.trialID}
                className="flex flex-col w-full px-4 py-2 bg-seasalt shadow-md mb-2 rounded-lg hover:border-2 hover:border-orange cursor-pointer"
            >
                <div className="flex flex-row items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">{trial.test}</h3>
                    <span className="text-gray-600 text-xs">
                        {trial.trialID}
                    </span>
                </div>
                <div className="flex flex-row justify-between">
                    <span className="text-gray-600 mr-2">
                        Date: {new Date(trial.date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-600">
                        Score: {trial.score || "N/A"}
                    </span>
                </div>
            </div>
        ));
    };

    return (
        <div className="flex flex-col w-full px-4 py-2 bg-seasalt shadow-md rounded-lg m-2 h-96">
            <h2 className="text-lg font-bold mb-2">Trial List</h2>
            <div className="overflow-y-auto">
                {trials && trials.length > 0 ? (
                    renderTrials()
                ) : (
                    <p className="text-gray-600">
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
