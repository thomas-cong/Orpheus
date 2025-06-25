import TTSAudioComponent from "../AudioComponents/TTSAudioComponent";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import AudioRecorder, { AudioRecorderRef } from "../AudioComponents/AudioRecorder";
import { usePatient } from "../context/PatientContext";
import React, { useState, useRef } from "react";

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
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "stopped">("idle");
    const audioRecorderRef = useRef<AudioRecorderRef>(null);

    const handleStartRecording = () => {
        audioRecorderRef.current?.startRecording();
        setRecordingStatus("recording");
    };

    const handleStopRecording = () => {
        audioRecorderRef.current?.stopRecording();
    };

    const handleRecordingStop = () => {
        setRecordingStatus("stopped");
    };

    const finishingFunction = () => {
        console.log(
            "Patient " + patientID + " recording " + recordingID + " completed"
        );
        setRecordingID(recordingID + 1);
        setTrialCycle(trialCycle + 1);
        setTrialStatus("Listening");
        setRecordingStatus("idle"); // Reset for next cycle
    };

    return (
        <div className="flex flex-col items-center gap-6 text-center">
            {(trialStatus === "Listening" || trialStatus === "Listening p2") && (
                <div className="flex flex-col items-center gap-6 text-center fadeIn">
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
                <div className="flex flex-col items-center gap-6 text-center fadeIn">
                    <InstructionDisplay instructions="Now, record a clip of you saying as many of the words as you can remember, in any order." />
                    <AudioRecorder
                        ref={audioRecorderRef}
                        recordings={recordings}
                        setRecordings={setRecordings}
                        onRecordingStop={handleRecordingStop}
                    />
                    <div className="flex gap-4">
                        {recordingStatus === "idle" && (
                            <button className="button" onClick={handleStartRecording}>
                                Start Recording
                            </button>
                        )}
                        {recordingStatus === "recording" && (
                            <button className="button" onClick={handleStopRecording}>
                                Stop Recording
                            </button>
                        )}
                        {recordingStatus === "stopped" && (
                            <button className="button" onClick={finishingFunction}>
                                Finished Recording
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RAVLTCycle;
