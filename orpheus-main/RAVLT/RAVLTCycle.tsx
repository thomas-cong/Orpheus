import TTSAudioComponent from "../AudioComponents/TTSAudioComponent";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import AudioRecorder from "../AudioComponents/AudioRecorder";
import { usePatient } from "../context/PatientContext";
import React from "react";

const RAVLTCycle = (
    wordArray: string[],
    trialStatus: string,
    setTrialStatus: (status: string) => void,
    recordingID: number,
    setRecordingID: (id: number) => void,
    trialCycle: number,
    setTrialCycle: (cycle: number) => void,
    recordings: Blob[],
    setRecordings: (recordings: Blob[]) => void
) => {
    const { patientID } = usePatient();
    const finishingFunction = () => {
        console.log(
            "Patient " + patientID + " recording " + recordingID + " completed"
        );
        setRecordingID(recordingID + 1);
        setTrialCycle(trialCycle + 1);
        setTrialStatus("Listening");
        console.log("filler function");
    };
    return (
        <div className="flex flex-col items-center">
            {(trialStatus === "Listening" ||
                trialStatus === "Listening p2") && (
                <div className="flex flex-col items-center m-10 fadeIn">
                    {trialStatus === "Listening" && (
                        <InstructionDisplay
                            title="RAVLT"
                            instructions="Press the button below to hear the words. You will hear a countdown, then the words will play. Remember, after pressing this button you will not be able to hear them again."
                        />
                    )}
                    {trialStatus === "Listening p2" && (
                        <div className="fadeIn">
                            <InstructionDisplay
                                title="RAVLT Listening"
                                instructions="Listen to the words, and try to remember as many as possible."
                            />
                        </div>
                    )}
                    <TTSAudioComponent
                        wordArray={wordArray}
                        countdown={3}
                        delay={1}
                        onEnd={() => setTrialStatus("Recording")}
                        onStart={() => setTrialStatus("Listening p2")}
                    />
                </div>
            )}
            {trialStatus === "Recording" && (
                <div className="flex flex-col items-center m-10 fadeIn">
                    <InstructionDisplay instructions="Now, record a clip of you saying as many of the words as you can remember, in any order." />
                    <AudioRecorder
                        recordings={recordings}
                        setRecordings={setRecordings}
                    />
                    <button className="button" onClick={finishingFunction}>
                        Finished Recording
                    </button>
                </div>
            )}
        </div>
    );
};

export default RAVLTCycle;
