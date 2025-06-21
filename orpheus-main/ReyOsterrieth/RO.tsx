import React, { useState, useEffect } from "react";
import Copy from "./Copy";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import InstructionsDisplay from "../InstructionsDisplay/InstructionDisplay";
import { usePatient } from "../context/PatientContext";
import { post } from "../../global-files/utilities";

const RO = ({
    setTest,
    setDemographicsCollected,
    trialID,
}: {
    setTest: (test: string) => void;
    setDemographicsCollected: (collected: boolean) => void;
    trialID: string;
}) => {
    const { patientID } = usePatient();
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [hasUploaded, setHasUploaded] = useState(false);

    // Helper to sanitize names for Azure Blob Storage
    const sanitizeForAzure = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    };
    const [condition, setCondition] = useState<number | null>(null);
    // either 0: Copy, 1: Immediate, 2: Delayed, or null; not showing the test
    const [showProgression, setShowProgression] = useState(true);
    const [testStage, setTestStage] = useState(0);
    const [instructionData, setInstructionData] = useState({
        title: "",
        instructions: "",
    });
    const handleImageCapture = (img: string) => {
        setCapturedImages((prev) => [...prev, img]);
    };

    const getInstructionData = (stage: number) => {
        switch (stage) {
            case 0:
                return {
                    title: "Rey Osterrieth Complex Figure Test",
                    instructions:
                        "This test assesses visuospatial abilities, memory, attention, and working memory. You will be asked to copy a complex figure and later reproduce it from memory.",
                };
            case 1:
                return {
                    title: "Immediate Copy",
                    instructions:
                        "Please copy the figure shown as accurately as possible. Take your time and try to be precise.",
                };
            case 2:
                setCondition(0);
                setShowProgression(false);
            case 3:
                return {
                    title: "Immediate Recall",
                    instructions:
                        "Without looking at the original figure, please draw the figure from memory as accurately as possible.",
                };
            case 4:
                setCondition(1);
                setShowProgression(false);
            case 5:
                return {
                    title: "Delayed Recall",
                    instructions:
                        "Without looking at the original figure, please draw the figure from memory as accurately as possible.",
                };
            case 6:
                setShowProgression(false);
            default:
                return {
                    title: "Rey Osterrieth Complex Figure Test",
                    instructions:
                        "Please follow the instructions for each stage of the test.",
                };
        }
    };

    // Upload images to Azure when test progresses beyond capture stage and images collected
    useEffect(() => {
        const uploadImages = async () => {
            if (hasUploaded || capturedImages.length === 0) return;
            const safeTrialID = sanitizeForAzure(trialID);
            const containerName = `${safeTrialID}`;

            // Ensure container exists
            await post("/api/imageStorage/createContainer", { containerName });

            let index = 0;
            for (const imgData of capturedImages) {
                // Convert base64 data URL to Blob
                const byteString = atob(imgData.split(",")[1]);
                const mimeString = imgData.split(",")[0].split(":")[1].split(";")[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                const fileName = `${safeTrialID}-${index}.png`;
                const file = new File([blob], fileName, { type: mimeString });
                const formData = new FormData();
                formData.append("containerName", containerName);
                formData.append("blobName", fileName);
                formData.append("file", file);

                await fetch("/api/imageStorage/uploadBlob", {
                    method: "POST",
                    body: formData,
                });
                index++;
            }

            // Update trial status in DB
            await post("/api/ro/updateTrial", {
                trialID,
                patientID,
                date: new Date().toISOString(),
                status: "complete",
            });
            setHasUploaded(true);
        };

        if (!showProgression && !hasUploaded) {
            uploadImages();
            console.log("Uploaded images");
        }
    }, [showProgression, capturedImages, hasUploaded]);

    useEffect(() => {
        const instructionData = getInstructionData(testStage);
        setInstructionData(instructionData);
    }, [testStage]);

    return (
        <>
            {showProgression && (
                <div className="flex flex-col items-center justify-start">
                    <InstructionsDisplay
                        title={instructionData.title}
                        instructions={instructionData.instructions}
                    />
                    <TestProgressionButton
                        onClick={() => {
                            setTestStage(testStage + 1);
                        }}
                        text="Next"
                    />
                </div>
            )}
            {condition === 0 && <Copy trialID={trialID} onCapture={handleImageCapture} />}
        </>
    );
};
export default RO;
