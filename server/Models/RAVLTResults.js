import mongoose from "mongoose";

const RAVLTResultsSchema = new mongoose.Schema({
    patientID: { type: String, default: "" },
    trialID: { type: String, required: true },
    transcriptionID: { type: String, default: "" },
    transcribedWords: { type: [Object], default: [] },
    testWords: { type: [String], required: true },
    interferenceWords: { type: [String], required: true },
    totalRecallScore: { type: Number, default: -1 },
    similarityIndex: { type: Number, default: -1 },
    semanticSimilarityIndex: { type: Number, default: -1 },
});
export default mongoose.model("RAVLTResults", RAVLTResultsSchema);
