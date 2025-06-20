import React, { useState } from "react";
import Copy from "./Copy";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import InstructionsDisplay from "../InstructionsDisplay/InstructionDisplay";
import { useEffect } from "react";

const RO = ({
    setTest,
    setDemographicsCollected,
    trialID,
}: {
    setTest: (test: string) => void;
    setDemographicsCollected: (collected: boolean) => void;
    trialID: string;
}) => {
    const [condition, setCondition] = useState<number | null>(null);
    // either 0: Copy, 1: Immediate, 2: Delayed, or null; not showing the test
    const [showProgression, setShowProgression] = useState(true);
    const [testStage, setTestStage] = useState(0);
    const [instructionData, setInstructionData] = useState({
        title: "",
        instructions: "",
    });
    const getInstructionData = (stage: number) => {
        switch (stage) {
            case 0:
                return {
                    title: "Rey Osterrieth Complex Figure Test",
                    instructions:
                        "This test assesses visuospatial abilities, memory, attention, and working memory. You will be asked to copy a complex figure and later reproduce it from memory.",
                };
            case 1:
                return {
                    title: "Immediate Copy",
                    instructions:
                        "Please copy the figure shown as accurately as possible. Take your time and try to be precise.",
                };
            case 2:
                setCondition(0);
                setShowProgression(false);
            case 3:
                return {
                    title: "Immediate Recall",
                    instructions:
                        "Without looking at the original figure, please draw the figure from memory as accurately as possible.",
                };
            case 4:
                setCondition(1);
                setShowProgression(false);
            case 5:
                return {
                    title: "Delayed Recall",
                    instructions:
                        "Without looking at the original figure, please draw the figure from memory as accurately as possible.",
                };
            case 6:
                setShowProgression(false);
            default:
                return {
                    title: "Rey Osterrieth Complex Figure Test",
                    instructions:
                        "Please follow the instructions for each stage of the test.",
                };
        }
    };

    useEffect(() => {
        const instructionData = getInstructionData(testStage);
        setInstructionData(instructionData);
    }, [testStage]);

    return (
        <>
            {showProgression && (
                <div className="flex flex-col items-center justify-start">
                    <InstructionsDisplay
                        title={instructionData.title}
                        instructions={instructionData.instructions}
                    />
                    <TestProgressionButton
                        onClick={() => {
                            setTestStage(testStage + 1);
                        }}
                        text="Next"
                    />
                </div>
            )}
            {condition === 0 && <Copy />}
        </>
    );
};
export default RO;
