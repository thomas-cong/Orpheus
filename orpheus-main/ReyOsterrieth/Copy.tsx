import React, { useRef, useState } from "react";
import CameraComponent from "../ImageCapture/CameraComponent";

const Copy = () => {
    const [receivedImage, setReceivedImage] = useState<string | null>(null);

    return (
        <div>
            <CameraComponent onCapture={setReceivedImage} />
        </div>
    );
};

export default Copy;
