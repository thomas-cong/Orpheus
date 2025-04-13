import { useState, useEffect } from "react";
import { useRef } from "react";
// import { post } from "../utilities";
// import { usePatient } from "../context/PatientContext";
interface AudioRecorderProps {
    // patientID: string;
    // trialID: string;
    // trialCycle: number;
    recordings: Blob[];
    setRecordings: (recordings: Blob[]) => void;
}

const AudioRecorder = ({ recordings, setRecordings }: AudioRecorderProps) => {
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
                setRecordings([...recordings, audioBlob]);
                const audioUrl = URL.createObjectURL(audioBlob);
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
