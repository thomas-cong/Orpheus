import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

interface AudioWaveformPlaybackProps {
    url: string;
}

const AudioWaveformPlayback: React.FC<AudioWaveformPlaybackProps> = ({
    url,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const waveSurferRef = useRef<WaveSurfer | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            if (waveSurferRef.current) {
                const { volume, muted } = e.detail;
                (waveSurferRef.current as any)?.setMute?.(muted);
                waveSurferRef.current.setVolume(volume);
            }
        };
        window.addEventListener("global-volume-change", handler as any);
        return () =>
            window.removeEventListener("global-volume-change", handler as any);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        waveSurferRef.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: "#1775d3",
            progressColor: "#0539b6",
            cursorColor: "#ff6000",
            height: 80,
            barWidth: 2,
        });

        waveSurferRef.current.load(url);
        waveSurferRef.current.on("ready", () => {
            // set initial volume from global control
            const gv = (window as any).__globalVolume;
            if (typeof gv === "number") {
                waveSurferRef.current!.setVolume(gv);
            }
            // register instance globally for AudioControl
            const w = window as any;
            if (!w.__waveSurfers) w.__waveSurfers = [];
            w.__waveSurfers.push(waveSurferRef.current);
            setIsReady(true);
        });
        waveSurferRef.current.on("play", () => setIsPlaying(true));
        waveSurferRef.current.on("pause", () => setIsPlaying(false));
        waveSurferRef.current.on("finish", () => setIsPlaying(false));

        return () => {
            if (waveSurferRef.current) {
                // remove from global list
                const w = window as any;
                if (w.__waveSurfers) {
                    w.__waveSurfers = w.__waveSurfers.filter(
                        (ws: any) => ws !== waveSurferRef.current
                    );
                }
                waveSurferRef.current.destroy();
            }
        };
    }, [url]);

    const togglePlay = () => {
        if (!waveSurferRef.current) return;
        waveSurferRef.current.playPause();
        setIsPlaying(waveSurferRef.current.isPlaying());
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div ref={containerRef} className="w-full" />
            {isReady && (
                <IconButton onClick={togglePlay} sx={{ color: "#0539b6" }}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
            )}
        </div>
    );
};

export default AudioWaveformPlayback;
