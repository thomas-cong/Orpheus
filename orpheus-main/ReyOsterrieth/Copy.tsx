import React from "react";
import CameraComponent from "../ImageCapture/CameraComponent";
import { useState } from "react";

interface CopyProps {
    trialID: string;
    onCapture: (imageData: string) => void;
}

const Copy = ({ trialID, onCapture }: CopyProps) => {
    const [receivedImage, setReceivedImage] = useState<string | null>(null);
    const [readyToCapture, setReadyToCapture] = useState(false);

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
                    <div className="w-[500px] h-[500px] bg-seasalt rounded-lg shadow-lg">
                        Imagine Rey Osterrieth Figure
                    </div>
                    <button onClick={() => setReadyToCapture(true)}>
                        Upload Image
                    </button>
                </div>
            )}
        </div>
    );
};

export default Copy;
