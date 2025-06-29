import mongoose from "mongoose";
const RAVLTTrialSchema = new mongoose.Schema({
    patientID: { type: String, default: "" },
    trialID: { type: String, required: true },
    date: { type: Date, default: Date.now },
    transcriptionID: { type: String, default: "" },
    status: { type: String, default: "incomplete" },
});
export default mongoose.model("RAVLTTrial", RAVLTTrialSchema);
