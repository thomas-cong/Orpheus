import React, { useState, useEffect } from "react";
import InstructionsDisplay from "../InstructionsDisplay/InstructionDisplay";
import TestProgressionButton from "../TestProgression/TestProgressionButton";
import DelayTimer from "../TestProgression/DelayTimer";
import { usePatient } from "../context/PatientContext";
import { post } from "../../global-files/utilities";
import UploadImage from "./UploadImage";
import ROEndPage from "./ROEndPage";

/**
 * Implements the Rey Osterrieth Complex Figure Test. The test is
 * administered in 6 stages: introduction, immediate copy, immediate
 * recall, delayed recall, and an end-of-test stage. The test records
 * images of the patient's drawings and uploads them to Azure Blob
 * Storage. After the test is finished, the test status is updated in
 * the database.
 * @param {function} setTest - sets the name of the test being taken
 * @param {function} setDemographicsCollected - sets whether demographics
 * have been collected
 * @param {string} trialID - the ID of the trial
 * @return {JSX.Element} - a JSX element representing the test
 */

interface ROProps {
    setTest: (test: string) => void;
    setDemographicsCollected: (b: boolean) => void;
    trialID: string;
}

const RO: React.FC<ROProps> = ({
    setTest,
    setDemographicsCollected,
    trialID,
}) => {
    const { patientID } = usePatient();

    // 0-9 stage flow
    const [stage, setStage] = useState<number>(0);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [hasUploaded, setHasUploaded] = useState(false);

    // helper for azure-safe names
    const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const handleImageCapture = (img: string) => {
        setCapturedImages((prev) => [...prev, img]);
        setStage((prev) => prev + 1);
    };

    // upload to Azure & mark trial complete
    useEffect(() => {
        const doUpload = async () => {
            if (hasUploaded || stage !== 9 || capturedImages.length === 0)
                return;
            const safe = sanitize(trialID);
            const containerName = safe;

            await post("/api/imageStorage/createContainer", { containerName });

            let idx = 0;
            for (const dataUrl of capturedImages) {
                const byteString = atob(dataUrl.split(",")[1]);
                const mime = dataUrl.split(",")[0].split(":")[1].split(";")[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++)
                    ia[i] = byteString.charCodeAt(i);
                const blob = new Blob([ab], { type: mime });
                const fileName = `${safe}-${idx}.png`;
                const file = new File([blob], fileName, { type: mime });
                const form = new FormData();
                form.append("containerName", containerName);
                form.append("blobName", fileName);
                form.append("file", file);
                await fetch("/api/imageStorage/uploadBlob", {
                    method: "POST",
                    body: form,
                });
                idx++;
            }

            await post("/api/ro/updateTrial", {
                trialID,
                patientID,
                date: new Date().toISOString(),
                status: "complete",
            });
            setHasUploaded(true);
        };
        doUpload();
    }, [stage, capturedImages, hasUploaded]);

    // instruction helper
    const instructionFor = (st: number) => {
        switch (st) {
            case 0:
                return {
                    title: "Rey–Osterrieth Complex Figure Test",
                    instructions:
                        "You will copy a complex figure and later reproduce it from memory. Press Next to view the figure.",
                };
            case 2:
                return {
                    title: "Immediate Copy",
                    instructions:
                        "Copy the figure as accurately as possible. Press Next when ready to upload your drawing.",
                };
            case 4:
                return {
                    title: "Immediate Recall",
                    instructions:
                        "Now draw the figure from memory. Press Next when ready to upload.",
                };
            case 7:
                return {
                    title: "Delayed Recall",
                    instructions:
                        "Again, draw the figure from memory. Press Next when ready to upload.",
                };
            case 9:
                return {
                    title: "End of Test",
                    instructions: "Thank you for completing the test.",
                };
            default:
                return { title: "", instructions: "" };
        }
    };

    // UI sections ---------------------------------------------------
    const FigureDisplay = (
        <div className="flex flex-col items-center gap-6">
            <div className="w-[500px] h-[500px] bg-seasalt rounded-lg shadow-lg flex items-center justify-center text-gray-600">
                Complex Figure Placeholder
            </div>
            <TestProgressionButton
                text="Next"
                onClick={() => setStage(stage + 1)}
            />
        </div>
    );

    const InstructionPage = (st: number) => {
        const { title, instructions } = instructionFor(st);
        return (
            <div className="flex flex-col items-center gap-6 text-center">
                <InstructionsDisplay
                    title={title}
                    instructions={instructions}
                />
                <TestProgressionButton
                    text="Next"
                    onClick={() => setStage(stage + 1)}
                />
            </div>
        );
    };

    return (
        <div className="font-body w-full max-w-2xl min-h-[500px] p-8 mx-auto default-background rounded-xl shadow-md flex items-center justify-center">
            {stage === 0 && InstructionPage(0)}
            {stage === 1 && (
                <div className="flex flex-col items-center gap-6">
                    <div className="w-[500px] h-[500px] bg-seasalt rounded-lg shadow-lg flex items-center justify-center text-gray-600">
                        Complex Figure Placeholder
                    </div>
                    <InstructionsDisplay {...instructionFor(2)} />
                    <TestProgressionButton
                        text="Next"
                        onClick={() => setStage(stage + 1)}
                    />
                </div>
            )}
            {stage === 2 && (
                <UploadImage trialID={trialID} onCapture={handleImageCapture} />
            )}
            {stage === 3 && InstructionPage(4)}
            {stage === 4 && (
                <UploadImage trialID={trialID} onCapture={handleImageCapture} />
            )}
            {stage === 5 && (
                <DelayTimer
                    duration={10}
                    onTimerComplete={() => setStage(stage + 1)}
                />
            )}
            {stage === 6 && InstructionPage(7)}
            {stage === 7 && (
                <UploadImage trialID={trialID} onCapture={handleImageCapture} />
            )}
            {stage === 8 && (
                <ROEndPage
                    setTest={setTest}
                    setDemographicsCollected={setDemographicsCollected}
                />
            )}
        </div>
    );
};

export default RO;

//     setTest,
//     setDemographicsCollected,
//     trialID,
// }: {
//     setTest: (test: string) => void;
//     setDemographicsCollected: (collected: boolean) => void;
//     trialID: string;
// }) => {
//     const { patientID } = usePatient();
//     const [capturedImages, setCapturedImages] = useState<string[]>([]);
//     const [hasUploaded, setHasUploaded] = useState(false);

//     // Helper to sanitize names for Azure Blob Storage
//     const sanitizeForAzure = (name: string) => {
//         return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
//     };
//     // stage 0–9 implements the full 10-screen flow:
//     const [stage, setStage] = useState<number>(0);
//     // images captured in stages 3, 5, 8
//     const [instructionData, setInstructionData] = useState({
//         title: "",
//         instructions: "",
//     });
//         const handleImageCapture = (img: string) => {
//         setCapturedImages((prev) => [...prev, img]);
//         setStage((prev) => prev + 1);
//     }; = (img: string) => {
//         setTestStage(testStage + 1);
//         setCapturedImages((prev) => [...prev, img]);
//         setShowProgression(true);
//     };

//     /**
//      * Given a stage number, returns the title and instructions as an object to be rendered for the Rey Osterrieth Complex Figure Test.
//      * @param {number} stage - the stage of the test, from 0 (introduction) to 6 (end of test)
//      * @return {{title: string, instructions: string}} - an object with title and instructions as strings
//      */
//     // helper to map instruction pages
//     const getInstructionData = (step: number) => {
//         switch (step) {
//             case 0:
//                 return {
//                     title: "Rey Osterrieth Complex Figure Test",
//                     instructions:
//                         "This test assesses visuospatial abilities and memory. You will copy a complex figure and later reproduce it from memory.",
//                 };
//             case 2:
//                 return {
//                     title: "Immediate Copy",
//                     instructions:
//                         "Copy the figure shown as accurately as possible. Press Next when you are ready to start drawing (an upload screen will appear).",
//                 };
//             case 4:
//                 return {
//                     title: "Immediate Recall",
//                     instructions:
//                         "Without looking at the original figure, draw it from memory as accurately as possible. Press Next when ready to upload your drawing.",
//                 };
//             case 7:
//                 return {
//                     title: "Delayed Recall",
//                     instructions:
//                         "Again, draw the figure from memory as accurately as possible. Press Next when ready to upload your drawing.",
//                 };
//             case 9:
//                 return {
//                     title: "End of Test",
//                     instructions:
//                         "Thank you for completing the Rey–Osterrieth Complex Figure Test.",
//                 };
//             default:
//                 return { title: "", instructions: "" };
//         }
//     };
//         switch (stage) {
//             case 0:
//                 return {
//                     title: "Rey Osterrieth Complex Figure Test",
//                     instructions:
//                         "This test assesses visuospatial abilities, memory, attention, and working memory. You will be asked to copy a complex figure and later reproduce it from memory.",
//                 };
//             case 1:
//                 return {
//                     title: "Immediate Copy",
//                     instructions:
//                         "Please copy the figure shown as accurately as possible. Take your time and try to be precise.",
//                 };
//             case 2:
//                 setCondition(0);
//                 setShowProgression(false);
//             case 3:
//                 return {
//                     title: "Immediate Recall",
//                     instructions:
//                         "Without looking at the original figure, please draw the figure from memory as accurately as possible.",
//                 };
//             case 4:
//                 setCondition(1);
//                 setShowProgression(false);
//             case 5:
//                 return {
//                     title: "Delayed Recall",
//                     instructions:
//                         "Without looking at the original figure, please draw the figure from memory as accurately as possible.",
//                 };
//             case 6:
//                 setShowProgression(false);
//             case 7:
//                 return {
//                     title: "End of Test",
//                     instructions:
//                         "Thank you for taking the Rey Osterrieth Complex Figure Test. Your results have been uploaded.",
//                 };
//             default:
//                 return {
//                     title: "Rey Osterrieth Complex Figure Test",
//                     instructions:
//                         "Please follow the instructions for each stage of the test.",
//                 };
//         }
//     };

//         // Upload images to Azure when test ends
//     useEffect(() => {
//         const uploadImages = async () => {
//             if (hasUploaded || capturedImages.length === 0) return;
//             const safeTrialID = sanitizeForAzure(trialID);
//             const containerName = `${safeTrialID}`;

//             // Ensure container exists
//             await post("/api/imageStorage/createContainer", { containerName });

//             let index = 0;
//             for (const imgData of capturedImages) {
//                 // Convert base64 data URL to Blob
//                 const byteString = atob(imgData.split(",")[1]);
//                 const mimeString = imgData
//                     .split(",")[0]
//                     .split(":")[1]
//                     .split(";")[0];
//                 const ab = new ArrayBuffer(byteString.length);
//                 const ia = new Uint8Array(ab);
//                 for (let i = 0; i < byteString.length; i++) {
//                     ia[i] = byteString.charCodeAt(i);
//                 }
//                 const blob = new Blob([ab], { type: mimeString });
//                 const fileName = `${safeTrialID}-${index}.png`;
//                 const file = new File([blob], fileName, { type: mimeString });
//                 const formData = new FormData();
//                 formData.append("containerName", containerName);
//                 formData.append("blobName", fileName);
//                 formData.append("file", file);

//                 await fetch("/api/imageStorage/uploadBlob", {
//                     method: "POST",
//                     body: formData,
//                 });
//                 index++;
//             }

//             // Update trial status in DB
//             await post("/api/ro/updateTrial", {
//                 trialID,
//                 patientID,
//                 date: new Date().toISOString(),
//                 status: "complete",
//             });
//             setHasUploaded(true);
//         };

//                 if (stage === 9 && !hasUploaded) {
//             uploadImages();
//             console.log("Uploaded images");
//         }
//         }, [stage, capturedImages, hasUploaded]);

//     useEffect(() => {
//                 const instructionData = getInstructionData(stage);
//         setInstructionData(instructionData);
//         }, [stage]);

//         return (
//                 <div className="font-funnel-sans max-w-xl mx-auto flex items-center justify-center">
//             {showProgression && (
//                 <div className="flex flex-col items-center justify-start">
//                     <InstructionsDisplay
//                         title={instructionData.title}
//                         instructions={instructionData.instructions}
//                     />
//                     <TestProgressionButton
//                         onClick={() => {
//                             setTestStage(testStage + 1);
//                             setShowProgression(false);
//                         }}
//                         text="Next"
//                     />
//                 </div>
//             )}
//             {!showProgression && condition === 0 && (
//                 <Copy trialID={trialID} onCapture={handleImageCapture} />
//             )}
//             {!showProgression && condition === 1 && (
//                 <ImmediateRecall
//                     trialID={trialID}
//                     onCapture={handleImageCapture}
//                 />
//             )}
//             {!showProgression && condition === 2 && (
//                 <DelayedRecall
//                     trialID={trialID}
//                     onCapture={handleImageCapture}
//                 />
//             )}
//         </>
//     );
// };
//         </div>
//     );
// };

// export default RO;
