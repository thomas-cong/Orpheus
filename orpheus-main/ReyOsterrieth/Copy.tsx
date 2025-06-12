import React, { useRef, useState } from "react";
import FreehandCanvas, {
    FreehandCanvasRef,
} from "../DrawingInput/FreehandCanvas";
import SubmissionButton from "./SubmissionButton";

const Copy = () => {
    // State to store the captured image data
    const [imageData, setImageData] = useState<string | null>(null);
    // Reference to the canvas component - initialize with an empty object to avoid null issues
    const canvasRef = useRef<FreehandCanvasRef>({});
    // Function to handle image capture from the canvas
    const handleImageCapture = (data: string) => {
        setImageData(data);
        console.log("Image captured and stored in state");
    };
    // Function to manually capture the image using the ref
    const captureImage = () => {
        console.log("Manually capturing image", canvasRef);
        // Check if canvasRef exists
        if (!canvasRef) {
            console.error("Canvas ref is undefined");
            return;
        }
        // Check if canvasRef.current exists
        if (!canvasRef.current) {
            console.error("Canvas ref current is null");
            return;
        }
        // Check if getImageData method exists
        if (!canvasRef.current.getImageData) {
            console.error("getImageData method not found on ref");
            return;
        }

        // Try to get the image data
        try {
            const data = canvasRef.current.getImageData();
            console.log(
                "getImageData returned:",
                data ? "data exists" : "null"
            );

            if (data) {
                setImageData(data);
                console.log("Image manually captured and stored in state");
            } else {
                console.error("Image data is null");
            }
        } catch (error) {
            console.error("Error capturing image:", error);
        }
    };

    return (
        <div className="bg-gray-900 text-white p-4">
            <h1 className="text-blue-400 text-2xl mb-4">Copy</h1>

            {/* Canvas component with canvasRef prop and capture callback */}
            <FreehandCanvas
                canvasRef={canvasRef}
                onImageCapture={handleImageCapture}
            />

            {/* Manual capture button */}
            <SubmissionButton onConfirm={captureImage} />
            {imageData && (
                <img
                    src={imageData}
                    alt="Captured Image"
                    style={{ width: "100%", height: "auto" }}
                />
            )}
        </div>
    );
};

export default Copy;
