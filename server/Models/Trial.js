import mongoose from "mongoose";
const TrialSchema = new mongoose.Schema({
    patientID: String,
    trialID: String,
    test: String,
    date: Date,
});
export default mongoose.model("Trial", TrialSchema);
