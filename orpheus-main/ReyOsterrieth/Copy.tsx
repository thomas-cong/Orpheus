import React, { useRef, useState } from "react";
import CameraComponent from "../ImageCapture/CameraComponent";

const Copy = () => {
    const [receivedImage, setReceivedImage] = useState<string | null>(null);

    return (
        <div>
            <h1>Copy</h1>
            <CameraComponent onCapture={setReceivedImage} />
        </div>
    );
};

export default Copy;
