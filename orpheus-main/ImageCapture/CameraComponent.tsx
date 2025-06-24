import React, { useState, useRef, useEffect } from "react";

const CameraComponent = (props: {
    onCapture?: (imageData: string) => void;
    trialID: string;
}) => {
    const [isActive, setIsActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Clean up function to stop the camera when component unmounts
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    /**
     * Tries to start the camera and display the feed.
     *
     * @async
     *
     * @throws Will alert the user if unable to access the camera, and log an
     * error to the console.
     */
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsActive(true);
                setCapturedImage(null);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Unable to access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsActive(false);
        }
    };

    const toggleCamera = () => {
        if (isActive) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw the current video frame to the canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert canvas to data URL
                const imageData = canvas.toDataURL("image/png");

                // Stop the camera first, then set the captured image
                stopCamera();
                setCapturedImage(imageData);
            }
        }
    };
    const submitImage = () => {
        if (capturedImage) {
            props.onCapture?.(capturedImage);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        stopCamera();
        startCamera();
    };

    return (
        <div className="default-background p-4 rounded-lg w-[500px] h-[500px] shadow-lg">
            <h2 className="text-blue-300 text-xl mb-4">Camera</h2>

            <div className="relative">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={`w-full rounded-md ${
                                !isActive ? "hidden" : ""
                            }`}
                            style={{
                                maxHeight: "500px",
                                backgroundColor: "#1f2937",
                            }}
                        />
                        {!isActive && (
                            <div className="default-background rounded-md w-full h-64 flex items-center justify-center">
                                <p className="text-gray-400">Camera inactive</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="relative">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full rounded-md"
                            style={{ maxHeight: "500px" }}
                        />
                    </div>
                )}

                {isActive && <canvas ref={canvasRef} className="hidden" />}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <button className="button" onClick={toggleCamera}>
                    {isActive ? "Stop Camera" : "Start Camera"}
                </button>

                {isActive && !capturedImage && (
                    <button className="button" onClick={captureImage}>
                        Take Photo
                    </button>
                )}

                {capturedImage && (
                    <>
                        <button className="button" onClick={retakePhoto}>
                            Retake
                        </button>
                        <button className="button" onClick={submitImage}>
                            Submit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraComponent;
