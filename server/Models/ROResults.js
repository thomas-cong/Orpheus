import mongoose from "mongoose";

const ROResultsSchema = new mongoose.Schema({
    patientID: String,
    trialID: String,
    imageBin: String,
});
export default mongoose.model("ROResults", ROResultsSchema);
