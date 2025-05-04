import RAVLTResults from "../Models/RAVLTResults.js";
import levenshteinDistance from "../AnalysisAlgorithms/LevenshteinDistance.js";
import doubleMetaphone from "../AnalysisAlgorithms/NaturalPhoneticAlgs.js";
const router = express.Router();

let useModel;
async function getUseModel() {
    if (!useModel) useModel = await use.load();
    return useModel;
}
router.post("/calculateRAVLTResults", async (req, res) => {
    if (!req.body.patientID || !req.body.trialID) {
        return res.status(400).send({ msg: "Missing required fields" });
    }
    const { patientID, trialID } = req.body;
    const results = await RAVLTResults.findOne({
        patientID: patientID,
        trialID: trialID,
    });
    if (!results.transcribedWords) {
        return res.status(400).send({ msg: "Missing transcribed words" });
    }
    const transcribedWords = results.transcribedWords.map((w) => w.word);
    const testWords = results.testWords;
    // const interferenceWords = results.interferenceWords;

    // Compute total recall score (number of words correctly recalled)
    const totalRecallScore = testWords.filter((w) =>
        transcribedWords.includes(w)
    ).length;
    // Update total recall score in database
    RAVLTResults.findOneAndUpdate(
        { patientID: patientID, trialID: trialID },
        { totalRecallScore: totalRecallScore }
    )
        .then(() => {
            res.send({
                msg: "RAVLT results updated",
                totalRecallScore: totalRecallScore,
            });
        })
        .catch((error) => {
            console.error("Error updating RAVLT results:", error);
            res.status(500).send({ msg: "Error updating RAVLT results" });
        });
});
export default router;
