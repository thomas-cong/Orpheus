import mongoose from "mongoose";

const ROResultsSchema = new mongoose.Schema({
    patientID: { type: String, default: "" },
    trialID: { type: String, required: true },
    imageBin: { type: String, default: "" },
    similarityArray: { type: [Number], default: [] },
    thresholdSimilarityArray: { type: [Number], default: [] },
});
export default mongoose.model("ROResults", ROResultsSchema);
