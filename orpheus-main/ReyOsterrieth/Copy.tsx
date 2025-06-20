import CameraComponent from "../ImageCapture/CameraComponent";
import { useState } from "react";

const Copy = () => {
    const [receivedImage, setReceivedImage] = useState<string | null>(null);
    const [readyToCapture, setReadyToCapture] = useState(false);

    return (
        <div>
            {readyToCapture ? (
                <CameraComponent onCapture={setReceivedImage} />
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
