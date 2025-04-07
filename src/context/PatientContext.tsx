import React, { createContext, useContext, ReactNode, useState } from "react";

// Define the shape of our context
interface PatientContextType {
    patientID: string;
    setPatientID: (id: string) => void;
    trialID: string;
    setTrialID: (id: string) => void;
    firstName: string;
    setFirstName: (firstName: string) => void;
    lastName: string;
    setLastName: (lastName: string) => void;
    DOB: string;
    setDOB: (DOB: string) => void;
    educationLevel: string;
    setEducationLevel: (educationLevel: string) => void;
    ethnicity: string;
    setEthnicity: (ethnicity: string) => void;
}

// Create the context with default values
const PatientContext = createContext<PatientContextType>({
    patientID: "",
    setPatientID: () => {},
    trialID: "",
    setTrialID: () => {},
    firstName: "",
    setFirstName: () => {},
    lastName: "",
    setLastName: () => {},
    DOB: "",
    setDOB: () => {},
    educationLevel: "",
    setEducationLevel: () => {},
    ethnicity: "",
    setEthnicity: () => {},
});

// Create a provider component
interface PatientProviderProps {
    children: ReactNode;
}

export const PatientProvider: React.FC<PatientProviderProps> = ({
    children,
}) => {
    const [patientID, setPatientID] = useState("");
    const [trialID, setTrialID] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [DOB, setDOB] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [ethnicity, setEthnicity] = useState("");

    return (
        <PatientContext.Provider
            value={{
                patientID,
                setPatientID,
                trialID,
                setTrialID,
                firstName,
                setFirstName,
                lastName,
                setLastName,
                DOB,
                setDOB,
                educationLevel,
                setEducationLevel,
                ethnicity,
                setEthnicity,
            }}
        >
            {children}
        </PatientContext.Provider>
    );
};

// Create a custom hook for using this context
export const usePatient = () => useContext(PatientContext);
