import React from "react";
import { get, post } from "../../global-files/utilities";
import { useState } from "react";

const QueryBar = () => {
    const [patientID, setPatientID] = useState("");

    const patientQuery = (patientID: string) => {
        get("/api/patients/getPatient", { patientID: patientID }).then(
            (result) => {
                if (result.msg === "Patient not found") {
                    console.log("Patient not found");
                } else {
                    console.log(result);
                }
            }
        );
    };

    return (
        <div className="flex flex-row w-full px-4 py-2 bg-white shadow-md">
            <input
                type="text"
                placeholder="Patient ID"
                className="bg-white flex-1 rounded-lg p-2 mr-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange"
                onChange={(e) => setPatientID(e.target.value)}
            />
            <button
                className="bg-orange text-seasalt rounded-lg px-6 py-2 hover:bg-orange-900 transition-colors whitespace-nowrap focus:ring-2 focus:ring-orange"
                onClick={() => patientQuery(patientID)}
            >
                Get Patient Info
            </button>
        </div>
    );
};

export default QueryBar;
