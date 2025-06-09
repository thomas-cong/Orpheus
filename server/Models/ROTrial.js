import mongoose from "mongoose";
const ROTrialSchema = new mongoose.Schema({
    trialID: String,
    patientID: String,
    date: Date,
    imageBin: String,
    status: String,
});

const ROTrial = mongoose.model("ROTrial", ROTrialSchema);
export default ROTrial;
