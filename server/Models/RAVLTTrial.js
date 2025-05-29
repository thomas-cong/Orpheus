import mongoose from "mongoose";
const RAVLTTrialSchema = new mongoose.Schema({
    patientID: String,
    trialID: String,
    date: Date,
    transcriptionID: String,
    status: String,
});
export default mongoose.model("RAVLTTrial", RAVLTTrialSchema);
