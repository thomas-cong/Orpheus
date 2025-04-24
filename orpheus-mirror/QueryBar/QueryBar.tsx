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
        <div className="flex flex-col w-full px-4 py-2 bg-seasalt shadow-md">
            <div className="flex flex-row w-full mb-2">
                <input
                    type="text"
                    placeholder="First Name"
                    className="bg-seasalt flex-1 rounded-lg p-2 mr-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    className="bg-seasalt flex-1 rounded-lg p-2 mr-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>
            <div className="flex flex-row w-full mb-2">
                <input
                    type="text"
                    placeholder="Patient ID"
                    className="bg-seasalt flex-1 rounded-lg p-2 mr-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange"
                    value={patientID}
                    onChange={(e) => setPatientID(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="Date of Birth"
                    className="bg-seasalt flex-1 rounded-lg p-2 mr-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange"
                    value={DOB}
                    onChange={(e) => setDOB(e.target.value)}
                />
            </div>
            <button
                className="bg-orange text-seasalt rounded-lg px-6 py-2 hover:bg-orange-900 transition-colors whitespace-nowrap focus:ring-2 focus:ring-orange"
                onClick={patientQuery}
            >
                Get Patient Info
            </button>
        </div>
    );
};

export default QueryBar;
