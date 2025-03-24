import TTSAudioComponent from "../AudioComponents/TTSAudioComponent";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import AudioRecorder from "../AudioComponents/AudioRecorder";
const RAVLTestTrial = (
    wordArray: string[],
    patientID: string,
    trialID: string,
    trialStage: string,
    setTrialStage: (stage: string) => void,
    onEnd: () => void
) => {
    const fillerFunction = () => {
        console.log(
            "Patient " + patientID + " trial " + trialID + " completed"
        );
        onEnd();
        console.log("filler function");
    };
    return (
        <>
            {(trialStage === "Listening" || trialStage === "Listening p2") && (
                <>
                    <InstructionDisplay
                        instructions={
                            trialStage === "Listening"
                                ? "Press the button below to hear the words. You will hear a countdown, then the words will play. Remember, after pressing this button you will not be able to hear them again."
                                : "Listen to the words, and try to remember as many as possible."
                        }
                    />
                    <TTSAudioComponent
                        wordArray={wordArray}
                        countdown={3}
                        delay={1}
                        onEnd={() => setTrialStage("Recording")}
                        onStart={() => setTrialStage("Listening p2")}
                    />
                </>
            )}
            {trialStage === "Recording" && (
                <>
                    <InstructionDisplay instructions="Now, record a clip of you saying as many of the words as you can remember, in any order." />
                    <AudioRecorder />
                    <button onClick={fillerFunction}>Finished Recording</button>
                </>
            )}
        </>
    );
};
export default RAVLTestTrial;
