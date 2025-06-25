import React from "react";
import { usePatient } from "../context/PatientContext";

interface ROEndPageProps {
    setTest: (test: string) => void;
    setDemographicsCollected: (c: boolean) => void;
}

const ROEndPage: React.FC<ROEndPageProps> = ({ setTest, setDemographicsCollected }) => {
    const {
        setPatientID,
        setFirstName,
        setLastName,
        setDOB,
        setEducationLevel,
        setEthnicity,
    } = usePatient();

    const handleLogout = () => {
        setPatientID("");
        setFirstName("");
        setLastName("");
        setDOB("");
        setEducationLevel("");
        setEthnicity("");
        setTest("");
        setDemographicsCollected(false);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">RO Test Completed</h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl">
                Thank you for completing the Rey–Osterrieth Complex Figure Test. Your drawings have been
                uploaded successfully.
            </p>
            <div className="flex gap-4">
                <button
                    className="button"
                    onClick={() => setTest("")}
                >
                    Return to Menu
                </button>
                <button className="button" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default ROEndPage;
