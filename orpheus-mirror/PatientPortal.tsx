import React, { useState } from "react";
import { Link } from "react-router-dom";
import QueryBar from "./QueryBar/QueryBar";
import PatientList from "./PatientList/PatientList";
import TrialList from "./TrialList/TrialList";
import FileList from "./TestInfo/FileList";

const PatientPortal = () => {
    const [patients, setPatients] = useState([]);
    const [focusedPatientID, setFocusedPatientID] = useState(null);
    const [focusedContainerName, setFocusedContainerName] = useState("");

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-400">
                        Patient Portal
                    </h1>
                    <Link
                        to="/testing"
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md transition duration-200"
                    >
                        Go to Testing Dashboard
                    </Link>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">
                        Search Patients
                    </h2>
                    <QueryBar setPatients={setPatients} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-green-400">
                            Patient List
                        </h2>
                        <PatientList
                            patients={patients}
                            setFocusedPatientID={setFocusedPatientID}
                        />
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-green-400">
                            Available Tests
                        </h2>
                        <TrialList
                            patientID={focusedPatientID || ""}
                            setFocusedContainerName={setFocusedContainerName}
                        />
                        {focusedContainerName && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold mb-4 text-green-400">
                                    Test Files
                                </h2>
                                <FileList
                                    containerName={focusedContainerName}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientPortal;
