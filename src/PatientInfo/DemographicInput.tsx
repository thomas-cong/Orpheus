import { useState, useEffect } from "react";
import { get, post } from "../utilities";
import { usePatient } from "../context/PatientContext";

const DemographicInput = ({
    setDemographicsCollected,
}: {
    setDemographicsCollected: (demographicsCollected: boolean) => void;
}) => {
    const { 
        setPatientID,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        DOB,
        setDOB,
        educationLevel,
        setEducationLevel,
        ethnicity,
        setEthnicity 
    } = usePatient();
    // const [firstName, setFirstName] = useState("");
    // const [lastName, setLastName] = useState("");
    // const [DOB, setDOB] = useState("");
    // const [education, setEducation] = useState("");
    // const [ethnicity, setEthnicity] = useState("");

    // Validation states
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);

    // Validation function for names - only letters allowed
    const validateName = (name: string): boolean => {
        return /^[A-Za-z]+$/.test(name);
    };

    // Update form validity whenever inputs change
    useEffect(() => {
        const isValid =
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            DOB !== "" &&
            educationLevel !== "" &&
            ethnicity !== "" &&
            !firstNameError &&
            !lastNameError;

        setIsFormValid(isValid);
    }, [
        firstName,
        lastName,
        DOB,
        educationLevel,
        ethnicity,
        firstNameError,
        lastNameError,
    ]);
    const submit = async () => {
        // Generate patient ID using Hashing
        const { patientID } = await get("/api/patients/genPatientID", {
            firstName: firstName,
            lastName: lastName,
            DOB: DOB,
        });
        // Check if patient has already been collected for demographics
        await get("/api/patients/getPatientInfo", { patientID: patientID }).then(
            (result) => {
                if (result.msg === "Patient not found") {
                    // Patient does not exist, add new patient
                    post("/api/patients/addPatient", {
                        patientID: patientID,
                        firstName: firstName,
                        lastName: lastName,
                        DOB: DOB,
                        educationLevel: educationLevel,
                        ethnicity: ethnicity,
                    });
                }
            }
        );
        await get("/api/audioStorage/getContainer", { containerName: patientID }).then((result) => {
            if (result.msg === "Container not found") {
                post("/api/audioStorage/createContainer", { containerName: patientID });
            }
            console.log(result);
        });
        // Initialize the patient context with form data
        setPatientID(patientID);
        setFirstName(firstName);
        setLastName(lastName);
        setDOB(DOB);
        setEducationLevel(educationLevel);
        setEthnicity(ethnicity);
        setDemographicsCollected(true);
    };
    return (
        <div className="max-w-xl aspect-[3/2] drop-shadow-[20px_20px_8px_rgba(0,0,0,0.2)] rounded-lg bg-honeydew flex flex-col items-center">
            <div className="flex w-full justify-between mb-4 mt-4">
                <div className="flex flex-col w-45/100">
                    <input
                        className={`w-full ${
                            firstNameError ? "border-red-500 border-2" : ""
                        }`}
                        type="text"
                        placeholder="First Name"
                        onChange={(e) => {
                            const value = e.target.value;
                            setFirstName(value);
                            if (value && !validateName(value)) {
                                setFirstNameError(
                                    "First name should only contain letters"
                                );
                            } else {
                                setFirstNameError("");
                            }
                        }}
                        value={firstName}
                    />
                    {firstNameError && (
                        <span className="text-red-500 text-xs mt-1">
                            {firstNameError}
                        </span>
                    )}
                </div>
                <div className="flex flex-col w-45/100">
                    <input
                        className={`w-full ${
                            lastNameError ? "border-red-500 border-2" : ""
                        }`}
                        type="text"
                        placeholder="Last Name"
                        onChange={(e) => {
                            const value = e.target.value;
                            setLastName(value);
                            if (value && !validateName(value)) {
                                setLastNameError(
                                    "Last name should only contain letters"
                                );
                            } else {
                                setLastNameError("");
                            }
                        }}
                        value={lastName}
                    />
                    {lastNameError && (
                        <span className="text-red-500 text-xs mt-1">
                            {lastNameError}
                        </span>
                    )}
                </div>
            </div>
            <input
                className="w-90/100"
                type="date"
                placeholder="Date of Birth"
                onChange={(e) => setDOB(e.target.value)}
            />
            <select
                className="w-90/100"
                onChange={(e) => setEducationLevel(e.target.value)}
            >
                <option value="">Select Education Level</option>
                <option value="Primary">Primary/Middle School</option>
                <option value="HS">High School</option>
                <option value="College">College</option>
                <option value="Grad">Graduate School</option>
                <option value="Other">Other</option>
            </select>
            <select
                className="w-90/100"
                onChange={(e) => setEthnicity(e.target.value)}
            >
                <option value="">Select Ethnicity</option>
                <option value="African-American">African-American</option>
                <option value="Hispanic">Hispanic</option>
                <option value="East Asian">East Asian</option>
                <option value="South Asian">South Asian</option>
                <option value="Caucasian">Caucasian</option>
                <option value="Other">Other</option>
            </select>
            <button
                className={`${
                    isFormValid ? "bg-cerulean" : "bg-gray-400"
                } text-eblack h-15/100 w-50/100 rounded-lg p-2 text-center mt-4`}
                onClick={submit}
                disabled={!isFormValid}
            >
                Submit
            </button>
        </div>
    );
};

export default DemographicInput;
