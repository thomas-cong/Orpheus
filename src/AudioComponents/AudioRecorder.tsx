import { useState, useEffect } from "react";
import { useRef } from "react";
import { post } from "../utilities";
// import { usePatient } from "../context/PatientContext";
interface AudioRecorderProps {
    patientID: string;
    trialID: string;
    trialCycle: number;
}

const AudioRecorder = ({ patientID, trialID, trialCycle }: AudioRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedURL, setRecordedURL] = useState("");
    const [timer, setTimer] = useState(0);
    const mediaStream = useRef<MediaStream | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    useEffect(() => {
        if (timer > 120) {
            stopRecording();
        }
    }, [timer]);
    const startRecording = async () => {
        setIsRecording(true);
        try {
            setTimer(0);
            const incrementTimer = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
            incrementTimer;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaStream.current = stream;
            mediaRecorder.current = new MediaRecorder(stream);
            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.current.push(event.data);
                }
            };
            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(chunks.current, {
                    type: "audio/wav",
                });
                const audioUrl = URL.createObjectURL(audioBlob);
                const fileName = `${patientID}_${trialID}_${trialCycle}.wav`;
                const file = new File([audioBlob], fileName, {
                    type: "audio/wav",
                });

                try {
                    // Convert ArrayBuffer to Base64
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const base64Data = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
                    
                    // Upload to Azure
                    await post("/api/audioStorage/uploadBlob", {
                        containerName: patientID,
                        blobName: fileName,
                        data: base64Data
                    });
                    console.log(`Successfully uploaded ${fileName} to Azure`);
                } catch (error) {
                    console.error("Error uploading to Azure:", error);
                }
                
                setRecordedURL(audioUrl);
                chunks.current = [];
            };
            mediaRecorder.current.start();
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => {
                track.stop();
            });
        }
    };
    return (
        <div>
            {isRecording ? (
                <button onClick={stopRecording}>Stop Recording</button>
            ) : (
                <button onClick={startRecording}>Start Recording</button>
            )}
            {recordedURL && <audio src={recordedURL} controls />}
        </div>
    );
};
export default AudioRecorder;
