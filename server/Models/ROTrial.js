import mongoose from "mongoose";
const ROTrialSchema = new mongoose.Schema({
    trialID: { type: String, required: true },
    patientID: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    imageBin: { type: String, default: "" },
    status: { type: String, default: "incomplete" }
});

const ROTrial = mongoose.model("ROTrial", ROTrialSchema);
export default ROTrial;
