import GenerateWordsButton from "../TestGeneration/GenerateWordsButton";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import RAVLTCycle from "./RAVLTCycle";
import RAVLTEndPage from "./RAVLTEndPage";
import DelayTimer from "../TestProgression/DelayTimer";
import { useState, useEffect } from "react";
import { usePatient } from "../context/PatientContext";
import { get, post } from "../../global-files/utilities";
import React from "react";

const RAVLT = ({
    setTest,
    setDemographicsCollected,
    trialID,
}: {
    setTest: (test: string) => void;
    setDemographicsCollected: (collected: boolean) => void;
    trialID: string;
}) => {
    // We're using the PatientContext in child components, but not directly here
    const { patientID } = usePatient();
    const [wordArray, setWordArray] = useState<string[]>([]);
    const [interferenceArray, setInterferenceArray] = useState<string[]>([]);
    const [trialCycle, setTrialCycle] = useState(0);
    const [trialStatus, setTrialStatus] = useState("Listening");
    const [recordingID, setRecordingID] = useState(0);
    const [recordings, setRecordings] = useState<Array<Blob>>([]);
    // RAVLT cycle components
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
    // RAVLT cycle components for interference
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

    const RAVLTCycleComponentFinal = RAVLTCycle(
        [],
        trialStatus,
        setTrialStatus,
        recordingID,
        setRecordingID,
        trialCycle,
        setTrialCycle,
        recordings,
        setRecordings
    );
    // Helper to sanitize names for Azure Blob Storage
    const sanitizeForAzure = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    };
    // Upload recordings to Azure Blob Storage
    useEffect(() => {
        console.log("Trial Cycle: " + String(trialCycle));
        const uploadRecordings = async (trialID: string) => {
            let tempTrialCycle = 0;
            const safeTrialID = sanitizeForAzure(trialID);
            const containerName = `${safeTrialID}`;
            for (const audioBlob of recordings) {
                const fileName = `${safeTrialID}-${tempTrialCycle}.wav`;
                const file = new File([audioBlob], fileName, {
                    type: "audio/wav",
                });
                // Upload file to Azure Blob Storage
                try {
                    const formData = new FormData();
                    formData.append("containerName", containerName);
                    formData.append("blobName", fileName);
                    formData.append("file", file);

                    await fetch("/api/audioStorage/uploadBlob", {
                        method: "POST",
                        body: formData,
                    });
                    console.log(`Successfully uploaded ${fileName} to Azure`);
                } catch (error) {
                    // Handle error
                    console.error("Error uploading to Azure:", error);
                }
                tempTrialCycle++;
            }
        };
        // Only upload recordings when the test is finished (trialCycle === 11)
        if (trialCycle === 11 && recordings.length > 0) {
            // Sanitize trial ID for Azure Blob Storage
            const safeTrialID = sanitizeForAzure(trialID);
            const containerName = `${safeTrialID}`;
            // Create container in Azure Blob Storage
            const handleRAVLTEnd = async () => {
                await post("/api/audioStorage/createContainer", {
                    containerName: containerName,
                });
                // Upload recordings to Azure Blob Storage
                await uploadRecordings(trialID);
                // Add trial to database
                await post("/api/ravlt/updateTrial", {
                    trialID: trialID,
                    patientID: patientID,
                    date: new Date().toISOString(),
                    status: "complete",
                });
                // Transcribe recordings in Azure Blob Storage
                await post("/api/audioStorage/transcribe", {
                    containerName: containerName,
                    locale: "en-US",
                    displayName: "RAVLT Transcription " + trialID,
                    trialID: trialID,
                });
                console.log("patientID: " + patientID);
                console.log("trialID: " + trialID);
                console.log("transcriptionID: " + "None");
                console.log("transcribedWords: " + []);
                console.log("testWords: " + wordArray);
                console.log("interferenceWords: " + interferenceArray);
                console.log("totalRecallScore: " + 0);
                console.log("similarityIndex: " + 0);
                console.log("primacyRecencyIndex: " + 0);
                await post("/api/ravlt/addResults", {
                    patientID: patientID,
                    trialID: trialID,
                    transcriptionID: "None",
                    transcribedWords: [],
                    testWords: wordArray,
                    interferenceWords: interferenceArray,
                    totalRecallScore: 0,
                    similarityIndex: 0,
                    primacyRecencyIndex: 0,
                });
            };
            handleRAVLTEnd();
        }
    }, [trialCycle]);
    return (
        <div className="font-body max-w-xl aspect-[3/2] mx-auto drop-shadow-[20px_20px_8px_rgba(0,0,0,0.2)] flex items-center justify-center">
            {trialCycle === 0 && (
                <div className="flex flex-col items-center">
                    <InstructionDisplay
                        title="RAVLT"
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
                    <InstructionDisplay
                        title="RAVLT"
                        instructions="Press the button below to generate the words. Only press this when you are ready."
                    />
                    <GenerateWordsButton
                        numWords={5}
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
                    <InstructionDisplay
                        title="RAVLT"
                        instructions="Now, we will try a second list of words. This time, again, you should say back as many words as you can remember."
                    />
                    <GenerateWordsButton
                        numWords={5}
                        words={interferenceArray}
                        setWords={setInterferenceArray}
                        onClick={() => setTrialCycle(7)}
                    />
                </>
            )}
            {trialCycle === 7 && RAVLTCycleComponentInterference}
            {trialCycle === 8 && (
                <DelayTimer
                    duration={20}
                    onTimerComplete={() => setTrialCycle(9)}
                />
            )}
            {trialCycle === 9 && (
                <>
                    <InstructionDisplay
                        title="RAVLT"
                        instructions="Now, please try to recall as many words as possible from the first list of words that you learned."
                    />
                    <TestProgressionButton
                        onClick={() => setTrialCycle(10)}
                        text="Start"
                    />
                </>
            )}
            {trialCycle === 10 && RAVLTCycleComponentFinal}
            {trialCycle === 11 && (
                <RAVLTEndPage
                    setTest={setTest}
                    setDemographicsCollected={setDemographicsCollected}
                />
            )}
        </div>
    );
};

export default RAVLT;
