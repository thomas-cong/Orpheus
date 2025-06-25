import {
    useState,
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import React from "react";
import AudioWaveform from "./AudioWaveformMic";
import AudioWaveformPlayback from "./AudioWaveformPlayback";

interface AudioRecorderProps {
    recordings: Blob[];
    setRecordings: (recordings: Blob[]) => void;
    onRecordingStop: () => void;
}

export interface AudioRecorderRef {
    startRecording: () => void;
    stopRecording: () => void;
}

const AudioRecorder = forwardRef<AudioRecorderRef, AudioRecorderProps>(
    ({ recordings, setRecordings, onRecordingStop }, ref) => {
        const [isRecording, setIsRecording] = useState(false);
        const [recordedURL, setRecordedURL] = useState("");
        const [timer, setTimer] = useState(0);
        const mediaStream = useRef<MediaStream | null>(null);
        const mediaRecorder = useRef<MediaRecorder | null>(null);
        const chunks = useRef<Blob[]>([]);
        const index = recordings.length;
        const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
            if (timer > 120) {
                stopRecording();
            }
            // Cleanup interval on unmount
            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
            };
        }, [timer]);

        const startRecording = async () => {
            setIsRecording(true);
            try {
                setTimer(0);
                setRecordedURL(""); // Clear previous recording
                timerIntervalRef.current = setInterval(() => {
                    setTimer((prev) => prev + 1);
                }, 1000);

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
                    const tempRecordings = [...recordings];
                    tempRecordings[index] = audioBlob;
                    setRecordings(tempRecordings);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setRecordedURL(audioUrl);
                    chunks.current = [];
                    onRecordingStop(); // Notify parent that recording has stopped
                };
                mediaRecorder.current.start();
            } catch (error) {
                console.error("Error starting recording:", error);
                setIsRecording(false);
            }
        };

        const stopRecording = async () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            setIsRecording(false);
            if (
                mediaRecorder.current &&
                mediaRecorder.current.state !== "inactive"
            ) {
                mediaRecorder.current.stop();
            }
            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };

        useImperativeHandle(ref, () => ({
            startRecording,
            stopRecording,
        }));

        return (
            <div className="flex flex-col items-center gap-4">
                {isRecording && mediaStream.current && (
                    <AudioWaveform stream={mediaStream.current} />
                )}
                {recordedURL && <AudioWaveformPlayback url={recordedURL} /> }
            </div>
        );
    }
);
export default AudioRecorder;
