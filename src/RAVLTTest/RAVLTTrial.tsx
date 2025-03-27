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
        <div className="flex flex-col items-center">
            {(trialStage === "Listening" || trialStage === "Listening p2") && (
                <div className="flex flex-col items-center m-10 fadeIn">
                    {trialStage === "Listening" && (
                        <InstructionDisplay instructions="Press the button below to hear the words. You will hear a countdown, then the words will play. Remember, after pressing this button you will not be able to hear them again." />
                    )}
                    {trialStage === "Listening p2" && (
                        <div className="fadeIn">
                            <InstructionDisplay instructions="Listen to the words, and try to remember as many as possible." />
                        </div>
                    )}
                    <TTSAudioComponent
                        wordArray={wordArray}
                        countdown={3}
                        delay={1}
                        onEnd={() => setTrialStage("Recording")}
                        onStart={() => setTrialStage("Listening p2")}
                    />
                </div>
            )}
            {trialStage === "Recording" && (
                <div className="flex flex-col items-center m-10 fadeIn">
                    <InstructionDisplay instructions="Now, record a clip of you saying as many of the words as you can remember, in any order." />
                    <AudioRecorder />
                    <button onClick={fillerFunction}>Finished Recording</button>
                </div>
            )}
        </div>
    );
};

export default RAVLTestTrial;
