import React from "react";
import { get, post } from "../../global-files/utilities";
import { useState } from "react";

const QueryBar = (props: { setPatients: (patients: any) => void }) => {
    const [patientID, setPatientID] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [DOB, setDOB] = useState("");

    const patientQuery = () => {
        // Build query object with only filled fields
        const queryParams: Record<string, string> = {};

        if (patientID) queryParams.patientID = patientID;
        if (firstName) queryParams.firstName = firstName;
        if (lastName) queryParams.lastName = lastName;
        if (DOB) queryParams.DOB = DOB;

        // Only send query if at least one field is filled
        if (Object.keys(queryParams).length > 0) {
            get("/api/patients/getPatient", queryParams).then((result) => {
                if (result.msg === "Patient not found") {
                    console.log("Patient not found");
                } else {
                    props.setPatients(result.patients);
                }
            });
        } else {
            console.log("Please fill at least one search field");
        }
    };

    return (
        <div className="flex flex-col w-full px-4 py-2 bg-gray-800 border border-gray-700 shadow-md rounded-lg">
            <h2 className="text-lg font-bold mb-2 text-blue-400">Patient Search</h2>
            <div className="flex flex-row w-full mb-2">
                <input
                    type="text"
                    placeholder="First Name"
                    className="bg-gray-700 text-blue-200 flex-1 rounded-lg p-2 mr-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    className="bg-gray-700 text-blue-200 flex-1 rounded-lg p-2 mr-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>
            <div className="flex flex-row w-full mb-2">
                <input
                    type="text"
                    placeholder="Patient ID"
                    className="bg-gray-700 text-blue-200 flex-1 rounded-lg p-2 mr-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={patientID}
                    onChange={(e) => setPatientID(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="Date of Birth"
                    className="bg-gray-700 text-blue-200 flex-1 rounded-lg p-2 mr-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={DOB}
                    onChange={(e) => setDOB(e.target.value)}
                />
            </div>
            <button
                className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors whitespace-nowrap focus:ring-2 focus:ring-blue-400"
                onClick={patientQuery}
            >
                Get Patient Info
            </button>
        </div>
    );
};

export default QueryBar;
