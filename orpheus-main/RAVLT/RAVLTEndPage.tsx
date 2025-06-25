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
        <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h2 className="display-text">RAVLT Test Completed</h2>
            <p className="body-text text-center max-w-2xl">
                Thank you for completing the Rey Auditory Verbal Learning Test
                (RAVLT). Your responses have been recorded successfully.
            </p>
            <div className="flex gap-4">
                <button onClick={() => setTest("")} className="button">
                    Return to Test Selection
                </button>
                <button onClick={handleLogout} className="button">
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default RAVLTEndPage;
