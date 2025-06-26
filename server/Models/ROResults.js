import mongoose from "mongoose";

const ROResultsSchema = new mongoose.Schema({
    patientID: String,
    trialID: String,
    imageBin: String,
    similarityArray: Array,
});
export default mongoose.model("ROResults", ROResultsSchema);
