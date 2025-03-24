import GenerateWordsButton from "../TestGeneration/GenerateWordsButton";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import RAVLTestTrial from "./RAVLTTrial";
import { useState } from "react";

const RAVLTTest = (patientID: string, trialID: string) => {
    const [wordArray, setWordArray] = useState<string[]>([]);
    const [testStage, setTestStage] = useState(0);
    const [trialStage, setTrialStage] = useState("Listening");
    return (
        <>
            {testStage === 0 && (
                <>
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
                </>
            )}

            {testStage === 1 && (
                <>
                    <InstructionDisplay instructions="Press the button below to generate the words. Only press this when you are ready." />
                    <GenerateWordsButton
                        numWords={15}
                        words={wordArray}
                        setWords={setWordArray}
                        onClick={() => setTestStage(2)}
                    />
                </>
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
            {testStage === 7 && (<p> end of ravlt for now :D</p>)
        </>
    );
};

export default RAVLTTest;
