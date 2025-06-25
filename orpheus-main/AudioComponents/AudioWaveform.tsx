import React, { useEffect, useRef } from "react";

interface AudioWaveformProps {
    stream: MediaStream | null;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ stream }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationIdRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !stream) return;

        const audioCtx = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        const canvasCtx = canvas.getContext("2d")!;
        const draw = () => {
            if (!canvasRef.current) return;
            const { width, height } = canvasRef.current;
            analyser.getByteTimeDomainData(dataArray);
            canvasCtx.clearRect(0, 0, width, height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "#001f3f"; // Custom navy
            canvasCtx.beginPath();

            const sliceWidth = (width * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(width, height / 2);
            canvasCtx.stroke();

            animationIdRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            source.disconnect();
            analyser.disconnect();
            audioCtx.close();
        };
    }, [stream]);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={120}
            style={{ background: "transparent" }}
        />
    );
};

export default AudioWaveform;
