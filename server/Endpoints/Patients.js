import express from "express";
import Patient from "../Models/Patient.js";
import { stringToNumber } from "../helperfunctions.js";

const router = express.Router();

/**
 * @route GET /api/patients/genPatientID
 * @description Generate a deterministic patient ID based on patient information
 * @access Public
 * @param {string} req.query.firstName - Patient's first name
 * @param {string} req.query.lastName - Patient's last name
 * @param {string} req.query.DOB - Patient's date of birth
 * @returns {Object} - JSON object containing the generated patient ID
 * @returns {string} patientID - The generated patient ID with format "P-[hash]"
 */
router.get("/genPatientID", (req, res) => {
    let patientID =
        "P-" +
        stringToNumber(
            req.query.firstName + req.query.lastName + req.query.DOB
        );
    res.json({ patientID: patientID });
});

/**
 * @route GET /api/patients/getPatient
 * @description Retrieve patient information from the database by patient ID
 * @access Public
 * @param {string} req.query.patientID - The patient ID to look up
 * @returns {Object} - Either the patient information object or an error message
 * @returns {string} [msg] - Error message if patient not found or server error
 */
router.get("/getPatient", (req, res) => {
    // Queries patient info from MongoDB
    if (req.query.patientID) {
        // If patientID is provided, find by patientID- and only return one
        Patient.findOne({ patientID: req.query.patientID })
            .then((patient) => {
                // Returns patient info if found
                if (patient) {
                    res.json({ patient: patient });
                } else {
                    res.json({ msg: "Patient not found" });
                }
            })
            .catch((error) => {
                console.error("Error getting patient info:", error);
                res.status(500).send({ msg: "Error getting patient info" });
            });
    } else {
        // If no patientID is provided, find by other fields and return many
        Patient.find(req.query)
            .then((patients) => {
                res.json({ patients: patients });
            })
            .catch((error) => {
                console.error("Error getting patient info:", error);
                res.status(500).send({ msg: "Error getting patient info" });
            });
    }
});

/**
 * @route POST /api/patients/addPatient
 * @description Add a new patient to the database
 * @access Public
 * @param {Object} req.body - The patient information
 * @param {string} req.body.patientID - Unique identifier for the patient
 * @param {string} req.body.firstName - Patient's first name
 * @param {string} req.body.lastName - Patient's last name
 * @param {string} req.body.DOB - Patient's date of birth
 * @param {string} req.body.educationLevel - Patient's education level
 * @param {string} req.body.ethnicity - Patient's ethnicity
 * @returns {Object} - JSON object with success or error message
 * @returns {string} msg - Success or error message
 */
router.post("/addPatient", (req, res) => {
    // Validates all fields exist
    if (
        !req.body.patientID ||
        !req.body.DOB ||
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.educationLevel ||
        !req.body.ethnicity
    ) {
        res.status(400).send({ msg: "Missing required fields" });
        return;
    }
    const patient = new Patient(req.body);
    patient
        .save()
        .then(() => {
            res.send({ msg: "Patient added" });
        })
        .catch((error) => {
            console.error("Error adding patient:", error);
            res.status(500).send({ msg: "Error adding patient" });
        });
});

export default router;
