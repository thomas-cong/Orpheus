import GenerateWordsButton from "../TestGeneration/GenerateWordsButton";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import RAVLTestTrial from "./RAVLTTrial";
import { useState } from "react";

const RAVLTTest = (patientID: string, trialID: string) => {
    const [wordArray, setWordArray] = useState<string[]>([]);
    const [interferenceArray, setInterferenceArray] = useState<string[]>([]);
    const [testStage, setTestStage] = useState(0);
    const [trialStage, setTrialStage] = useState("Listening");
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
            {testStage === 2 &&
                RAVLTestTrial(
                    wordArray,
                    patientID,
                    trialID,
                    trialStage,
                    setTrialStage,
                    () => {
                        setTestStage(3);
                        setTrialStage("Listening");
                    }
                )}
            {testStage === 3 &&
                RAVLTestTrial(
                    wordArray,
                    patientID,
                    trialID,
                    trialStage,
                    setTrialStage,
                    () => {
                        setTestStage(4);
                        setTrialStage("Listening");
                    }
                )}
            {testStage === 4 &&
                RAVLTestTrial(
                    wordArray,
                    patientID,
                    trialID,
                    trialStage,
                    setTrialStage,
                    () => {
                        setTestStage(5);
                        setTrialStage("Listening");
                    }
                )}
            {testStage === 5 &&
                RAVLTestTrial(
                    wordArray,
                    patientID,
                    trialID,
                    trialStage,
                    setTrialStage,
                    () => {
                        setTestStage(6);
                        setTrialStage("Listening");
                    }
                )}
            {testStage === 6 &&
                RAVLTestTrial(
                    wordArray,
                    patientID,
                    trialID,
                    trialStage,
                    setTrialStage,
                    () => {
                        setTestStage(7);
                        setTrialStage("Listening");
                    }
                )}
            {testStage === 7 && (
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
            {testStage === 8 &&
                RAVLTestTrial(
                    interferenceArray,
                    patientID,
                    trialID,
                    trialStage,
                    setTrialStage,
                    () => {
                        setTestStage(9);
                        setTrialStage("Listening");
                    }
                )}
        </div>
    );
};

export default RAVLTTest;
