import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    patientID: String,
    DOB: String,
    educationLevel: String,
    ethnicity: String,
    firstName: String,
    lastName: String,
});
export default mongoose.model("Patient", patientSchema);
