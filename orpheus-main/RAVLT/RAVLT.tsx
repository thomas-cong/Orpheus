import GenerateWordsButton from "../TestGeneration/GenerateWordsButton";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import RAVLTCycle from "./RAVLTCycle";
import { useState, useEffect } from "react";
import { usePatient } from "../context/PatientContext";
import { get, post } from "../../global-files/utilities";
import React from "react";

const RAVLT = () => {
    // We're using the PatientContext in child components, but not directly here
    const { patientID } = usePatient();
    const [wordArray, setWordArray] = useState<string[]>([]);
    const [interferenceArray, setInterferenceArray] = useState<string[]>([]);
    const [trialCycle, setTrialCycle] = useState(0);
    const [trialStatus, setTrialStatus] = useState("Listening");
    const [recordingID, setRecordingID] = useState(0);
    const [recordings, setRecordings] = useState<Array<Blob>>([]);
    const RAVLTCycleComponent = RAVLTCycle(
        wordArray,
        trialStatus,
        setTrialStatus,
        recordingID,
        setRecordingID,
        trialCycle,
        setTrialCycle,
        recordings,
        setRecordings
    );
    const RAVLTCycleComponentInterference = RAVLTCycle(
        interferenceArray,
        trialStatus,
        setTrialStatus,
        recordingID,
        setRecordingID,
        trialCycle,
        setTrialCycle,
        recordings,
        setRecordings
    );
    useEffect(() => {
        console.log("Trial Cycle: " + String(trialCycle));
        const uploadRecordings = async (trialID: string) => {
            let tempTrialCycle = 0;
            for (const audioBlob of recordings) {
                const fileName = `${patientID}_${trialID}_${tempTrialCycle}.wav`;
                const file = new File([audioBlob], fileName, {
                    type: "audio/wav",
                });

                try {
                    // Convert ArrayBuffer to Base64
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const base64Data = btoa(
                        String.fromCharCode.apply(null, Array.from(uint8Array))
                    );

                    // Upload to Azure
                    await post("/api/audioStorage/uploadBlob", {
                        containerName: patientID,
                        blobName: fileName,
                        data: base64Data,
                    });
                    console.log(`Successfully uploaded ${fileName} to Azure`);
                } catch (error) {
                    console.error("Error uploading to Azure:", error);
                }
                tempTrialCycle++;
            }
        };

        // Only upload recordings when the test is finished (trialCycle === 8)
        if (trialCycle === 8 && recordings.length > 0) {
            get("/api/trials/genTrialID").then((result) => {
                const trialID = result.trialID;
                uploadRecordings(trialID);
                post("/api/trials/addTrial", {
                    patientID: patientID,
                    date: new Date().toISOString(),
                    test: "RAVLT",
                    trialID: trialID,
                    transcriptionID: "Not Transcribed",
                });
            });
        }
    }, [trialCycle]);
    return (
        <div className="max-w-xl aspect-[3/2] mx-auto drop-shadow-[20px_20px_8px_rgba(0,0,0,0.2)] rounded-lg bg-seasalt flex items-center justify-center slideIn">
            {trialCycle === 0 && (
                <div className="flex flex-col items-center">
                    <InstructionDisplay
                        instructions="You will hear a list of words. 
                        Listen carefully and try to remember them. 
                        When you hear the chime, say as many as you can remember. 
                        Don't worry if you don't remember them in the right order.
                        Are you ready?"
                    />
                    <TestProgressionButton
                        onClick={() => setTrialCycle(1)}
                        text="Start"
                    />
                </div>
            )}

            {trialCycle === 1 && (
                <div className="flex flex-col items-center m-10 fadeIn">
                    <InstructionDisplay instructions="Press the button below to generate the words. Only press this when you are ready." />
                    <GenerateWordsButton
                        numWords={1}
                        words={wordArray}
                        setWords={setWordArray}
                        onClick={() => setTrialCycle(2)}
                    />
                </div>
            )}
            {trialCycle === 2 && RAVLTCycleComponent}
            {trialCycle === 3 && RAVLTCycleComponent}
            {trialCycle === 4 && RAVLTCycleComponent}
            {trialCycle === 5 && RAVLTCycleComponent}
            {trialCycle === 6 && (
                <>
                    <InstructionDisplay instructions="Now, we will try a second list of words. This time, again, you should say back as many words as you can remember." />
                    <GenerateWordsButton
                        numWords={1}
                        words={interferenceArray}
                        setWords={setInterferenceArray}
                        onClick={() => setTrialCycle(7)}
                    />
                </>
            )}
            {trialCycle === 7 && RAVLTCycleComponentInterference}
        </div>
    );
};

export default RAVLT;
