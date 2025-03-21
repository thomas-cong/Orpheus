import TTSAudioComponent from "../AudioComponents/TTSAudioComponent";
import GenerateWordsButton from "../TestGeneration/GenerateWordsButton";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import RecordingAudioButton from "../AudioComponents/RecordingAudioButton";
import { useState } from "react";
const RAVLTTest = () => {
    const [wordArray, setWordArray] = useState<string[]>([]);
    const [testStage, setTestStage] = useState(0);
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
            {(testStage === 2 || testStage === 3) && (
                <>
                    <InstructionDisplay
                        instructions={
                            testStage === 2
                                ? "Press the button below to hear the words. You will hear a countdown, then the words will play. Remember, after pressing this button you will not be able to hear them again."
                                : "Listen to the words, and try to remember as many as possible."
                        }
                    />
                    <TTSAudioComponent
                        wordArray={wordArray}
                        onStart={() => setTestStage(3)}
                        countdown={3}
                        rate={0.4}
                        onEnd={() => setTestStage(4)}
                    />
                </>
            )}
            {testStage === 4 && (
                <>
                    <InstructionDisplay instructions="Now, record a clip of you saying as many of the words as you can remember, in any order." />
                </>
            )}
        </>
    );
};

export default RAVLTTest;
