import GenerateWordsButton from "../TestGeneration/GenerateWordsButton";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import RAVLTCycle from "./RAVLTCycle";
import { useState } from "react";
import { usePatient } from "../context/PatientContext";

const RAVLT = () => {
    // We're using the PatientContext in child components, but not directly here
    const {} = usePatient();
    const [wordArray, setWordArray] = useState<string[]>([]);
    const [interferenceArray, setInterferenceArray] = useState<string[]>([]);
    const [testStage, setTestStage] = useState(0);
    const [trialStage, setTrialStage] = useState("Listening");
    const [recordingID, setRecordingID] = useState(0);
    const RAVLTCycleComponent = RAVLTCycle(
        wordArray,
        trialStage,
        setTrialStage,
        recordingID,
        setRecordingID,
        testStage,
        setTestStage
    );
    return (
        <div className="max-w-xl aspect-[3/2] mx-auto drop-shadow-[20px_20px_8px_rgba(0,0,0,0.2)] rounded-lg bg-honeydew flex items-center justify-center slideIn">
            {testStage === 0 && (
                <div className="flex flex-col items-center">
                    <InstructionDisplay
                        instructions="You will hear a list of words. 
                        Listen carefully and try to remember them. 
                        When you hear the chime, say as many as you can remember. 
                        Don't worry if you don't remember them in the right order.
                        Are you ready?"
                    />
                    <TestProgressionButton
                        onClick={() => setTestStage(1)}
                        text="Start"
                    />
                </div>
            )}

            {testStage === 1 && (
                <div className="flex flex-col items-center m-10 fadeIn">
                    <InstructionDisplay instructions="Press the button below to generate the words. Only press this when you are ready." />
                    <GenerateWordsButton
                        numWords={15}
                        words={wordArray}
                        setWords={setWordArray}
                        onClick={() => setTestStage(2)}
                    />
                </div>
            )}
            {testStage === 2 && RAVLTCycleComponent}
            {testStage === 3 && RAVLTCycleComponent}
            {testStage === 4 && RAVLTCycleComponent}
            {testStage === 5 && RAVLTCycleComponent}
            {testStage === 6 && (
                <>
                    <InstructionDisplay instructions="Now, we will try a second list of words. This time, again, you should say back as many words as you can remember." />
                    <GenerateWordsButton
                        numWords={15}
                        words={interferenceArray}
                        setWords={setInterferenceArray}
                        onClick={() => setTestStage(8)}
                    />
                </>
            )}
            {testStage === 7 && RAVLTCycleComponent}
        </div>
    );
};

export default RAVLT;
