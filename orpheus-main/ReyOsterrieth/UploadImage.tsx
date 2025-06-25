import React from "react";
import CameraComponent from "../ImageCapture/CameraComponent";
import { useState } from "react";
import InstructionDisplay from "../InstructionsDisplay/InstructionDisplay";

interface UploadImageProps {
    trialID: string;
    onCapture: (imageData: string) => void;
}

const UploadImage = ({ trialID, onCapture }: UploadImageProps) => {
    const [readyToCapture, setReadyToCapture] = useState(false);
    const [receivedImage, setReceivedImage] = useState<string | null>(null);

    return (
        <div className="flex flex-col items-center gap-6 text-center">
            {
                <CameraComponent
                    onCapture={(img) => {
                        setReceivedImage(img);
                        onCapture(img);
                    }}
                    trialID={trialID}
                />
            }
        </div>
    );
};

export default UploadImage;
