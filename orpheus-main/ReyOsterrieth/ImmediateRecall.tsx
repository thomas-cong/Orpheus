import React from "react";
import CameraComponent from "../ImageCapture/CameraComponent";
import { useState } from "react";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";

interface ImmediateRecallProps {
    trialID: string;
    onCapture: (imageData: string) => void;
}

const ImmediateRecall = ({ trialID, onCapture }: ImmediateRecallProps) => {
    const [receivedImage, setReceivedImage] = useState<string | null>(null);
    const [readyToCapture, setReadyToCapture] = useState(false);
    const [showingFigure, setShowingFigure] = useState(true);

    return (
        <div>
            {readyToCapture ? (
                <CameraComponent
                    onCapture={(img) => {
                        setReceivedImage(img);
                        onCapture(img);
                    }}
                    trialID={trialID}
                />
            ) : (
                <div className="flex flex-col items-center">
                    {showingFigure ? (
                        <>
                            <div className="w-[500px] h-[500px] bg-seasalt rounded-lg shadow-lg">
                                Imagine Rey Osterrieth Figure
                            </div>
                            <button onClick={() => setShowingFigure(false)}>
                                Next
                            </button>
                        </>
                    ) : (
                        <InstructionDisplay
                            title="Immediate Recall"
                            instructions="Without looking at the original figure, please draw the figure from memory as accurately as possible."
                        />
                    )}
                    <button onClick={() => setReadyToCapture(true)}>
                        Upload Image
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImmediateRecall;
