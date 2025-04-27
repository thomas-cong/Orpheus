import React, { useState } from "react";
import QueryBar from "./QueryBar/QueryBar";
import "../global-files/index.css";
import PatientList from "./PatientList/PatientList";
import TrialList from "./TrialList/TrialList";
import FileList from "./TestInfo/FileList";

export default function App() {
    const [patients, setPatients] = useState([]);
    const [focusedPatientID, setFocusedPatientID] = useState(null);
    const [focusedContainerName, setFocusedContainerName] = useState("");
    return (
        <div className="flex flex-col min-h-screen">
            <QueryBar setPatients={setPatients} />
            <div className="flex flex-row w-full">
                <div className="w-1/2">
                    <PatientList
                        patients={patients}
                        setFocusedPatientID={setFocusedPatientID}
                    />
                </div>
                <div className="w-1/2">
                    <TrialList
                        patientID={focusedPatientID || ""}
                        setFocusedContainerName={setFocusedContainerName}
                    />
                </div>
            </div>
            <div className="w-full mt-4">
                <FileList containerName={focusedContainerName} />
            </div>
        </div>
    );
}
