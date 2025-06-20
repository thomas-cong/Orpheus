import CameraComponent from "../ImageCapture/CameraComponent";
import { useState } from "react";

const Copy = () => {
    const [receivedImage, setReceivedImage] = useState<string | null>(null);

    return (
        <div>
            <CameraComponent onCapture={setReceivedImage} />
        </div>
    );
};

export default Copy;
