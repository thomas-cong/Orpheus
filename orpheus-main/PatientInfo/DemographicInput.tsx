import { useState, useEffect } from "react";
import { get, post } from "../../global-files/utilities";
import { usePatient } from "../context/PatientContext";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";
import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

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
        setEthnicity,
    } = usePatient();

    // Validation states
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

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
        await get("/api/patients/getPatient", { patientID: patientID }).then(
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
        // Initialize the patient context with form data
        setPatientID(patientID);
        setFirstName(firstName);
        setLastName(lastName);
        setDOB(DOB);
        setEducationLevel(educationLevel);
        setEthnicity(ethnicity);
        setDemographicsCollected(true);
    };
    const handleSnackbarClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <div className="max-w-2xl flex flex-col items-start bg-white rounded-2xl shadow-2xl p-14 gap-4 relative">
            <h2 className="display-text text-2xl mb-4 absolute top-10 left-14">
                Patient Demographics
            </h2>
            <div className="flex w-full justify-between mt-10 gap-4">
                <div className="flex flex-col w-1/2 gap-2">
                    <input
                        className={`input h-12 text-lg border-2 ${
                            firstNameError
                                ? "border-red-500"
                                : "border-transparent"
                        }`}
                        type="text"
                        placeholder="First Name"
                        onChange={(e) => {
                            const value = e.target.value;
                            setFirstName(value);
                            if (value && !validateName(value)) {
                                const message =
                                    "First name should only contain letters";
                                setFirstNameError(message);
                                setSnackbarMessage(message);
                                setSnackbarOpen(true);
                            } else {
                                setFirstNameError("");
                            }
                        }}
                        value={firstName}
                    />
                </div>
                <div className="flex flex-col w-1/2 gap-2">
                    <input
                        className={`input h-12 text-lg border-2 ${
                            lastNameError
                                ? "border-red-500"
                                : "border-transparent"
                        }`}
                        type="text"
                        placeholder="Last Name"
                        onChange={(e) => {
                            const value = e.target.value;
                            setLastName(value);
                            if (value && !validateName(value)) {
                                const message =
                                    "Last name should only contain letters";
                                setLastNameError(message);
                                setSnackbarMessage(message);
                                setSnackbarOpen(true);
                            } else {
                                setLastNameError("");
                            }
                        }}
                        value={lastName}
                    />
                </div>
            </div>
            <div className="flex flex-col w-full gap-4">
                <input
                    className="input h-12 text-lg"
                    type="date"
                    placeholder="Date of Birth"
                    onChange={(e) => setDOB(e.target.value)}
                />
                <select
                    className="input h-12 text-lg"
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
                    className="input h-12 text-lg"
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
            </div>
            <CheckCircleTwoToneIcon
                sx={{
                    color: isFormValid ? "var(--custom-navy-200)" : "gray",
                    fontSize: "2rem",
                    opacity: isFormValid ? 1 : 0.5,
                    pointerEvents: isFormValid ? "auto" : "none",
                }}
                className="hover:cursor-pointer"
                onClick={isFormValid ? submit : undefined}
            />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="error"
                    sx={{
                        width: "100%",
                        color: "var(--custom-orange-100)",
                        backgroundColor: "white",
                        fontWeight: "semibold",
                        fontSize: "1rem",
                        fontFamily: "Funnel Sans",
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default DemographicInput;
