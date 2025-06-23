import React from "react";
import CameraComponent from "../ImageCapture/CameraComponent";
import { useState } from "react";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";
import DelayTimer from "../TestProgression/DelayTimer";

interface DelayedRecallProps {
    trialID: string;
    onCapture: (imageData: string) => void;
}

const DelayedRecall = ({ trialID, onCapture }: DelayedRecallProps) => {
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
                        <DelayTimer
                            duration={1200}
                            onTimerComplete={() => setReadyToCapture(true)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DelayedRecall;
