import mongoose from "mongoose";
const TrialSchema = new mongoose.Schema({
    patientID: String,
    trialID: String,
    test: String,
    date: Date,
    transcriptionID: String,
});
export default mongoose.model("Trial", TrialSchema);
