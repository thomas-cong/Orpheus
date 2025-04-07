import mongoose from "mongoose";

const patientInfoSchema = new mongoose.Schema({
    patientID: String,
    DOB: String,
    educationLevel: String,
    ethnicity: String,
    firstName: String,
    lastName: String,
});
export default mongoose.model("PatientInfo", patientInfoSchema);
