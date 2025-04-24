import React, { useState } from "react";
import QueryBar from "./QueryBar/QueryBar";
import "../global-files/index.css";
import PatientList from "./PatientList/PatientList";

export default function App() {
    const [patients, setPatients] = useState([]);
    return (
        <div className="flex flex-col min-h-screen">
            <QueryBar setPatients={setPatients} />
            <div className="flex flex-row w-full">
                <div className="w-1/2">
                    <PatientList patients={patients} />
                </div>
                <div className="w-1/2">
                    {/* Content for the right side can go here */}
                </div>
            </div>
        </div>
    );
}
