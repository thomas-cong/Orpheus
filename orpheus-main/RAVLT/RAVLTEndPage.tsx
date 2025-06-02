import React from "react";
import { usePatient } from "../context/PatientContext";

interface RAVLTEndPageProps {
    setTest: (test: string) => void;
    setDemographicsCollected: (collected: boolean) => void;
}

const RAVLTEndPage: React.FC<RAVLTEndPageProps> = ({
    setTest,
    setDemographicsCollected,
}) => {
    const {
        setPatientID,
        setFirstName,
        setLastName,
        setDOB,
        setEducationLevel,
        setEthnicity,
    } = usePatient();

    const handleLogout = () => {
        // Reset all patient information
        setPatientID("");
        setFirstName("");
        setLastName("");
        setDOB("");
        setEducationLevel("");
        setEthnicity("");
        // Reset test selection and demographics flag
        setTest("");
        setDemographicsCollected(false);
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
                RAVLT Test Completed
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl">
                Thank you for completing the Rey Auditory Verbal Learning Test
                (RAVLT). Your responses have been recorded successfully.
            </p>
            <div className="flex space-x-4">
                <button
                    onClick={() => setTest("")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Return to Test Selection
                </button>
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default RAVLTEndPage;
