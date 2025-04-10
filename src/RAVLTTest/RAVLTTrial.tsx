import TTSAudioComponent from "../AudioComponents/TTSAudioComponent";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import AudioRecorder from "../AudioComponents/AudioRecorder";
import { usePatient } from "../context/PatientContext";
const RAVLTestTrial = (
    wordArray: string[],
    trialStage: string,
    setTrialStage: (stage: string) => void,
    recordingID: number,
    setRecordingID: (id: number) => void,
    testStage: number,
    setTestStage: (stage: number) => void
) => {
    const { patientID, trialID } = usePatient();
    const finishingFunction = () => {
        console.log(
            "Patient " +
                patientID +
                " trial " +
                trialID +
                " recording " +
                recordingID +
                " completed"
        );
        setRecordingID(recordingID + 1);
        setTestStage(testStage + 1);
        setTrialStage("Listening");
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
                    <AudioRecorder patientID={patientID} trialID={trialID} testStage={testStage} />
                    <button onClick={finishingFunction}>
                        Finished Recording
                    </button>
                </div>
            )}
        </div>
    );
};

export default RAVLTestTrial;
