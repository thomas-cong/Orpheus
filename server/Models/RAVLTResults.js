import mongoose from "mongoose";

const RAVLTResultsSchema = new mongoose.Schema({
    patientID: String,
    trialID: String,
    transcriptionID: String,
    transcribedWords: Array,
    testWords: Array,
    interferenceWords: Array,
    totalRecallScore: Number,
    similarityIndex: Number,
    primacyRecencyIndex: Number,
});
export default mongoose.model("RAVLTResults", RAVLTResultsSchema);
