import mongoose from "mongoose";

const ROResultsSchema = new mongoose.Schema({
    patientID: String,
    trialID: String,
    imageBin: String,
    similarityIndex: Array,
    jitter: Array,
});
export default mongoose.model("ROResults", ROResultsSchema);
