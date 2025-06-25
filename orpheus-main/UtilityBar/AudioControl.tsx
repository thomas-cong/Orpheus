import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const AudioControl: React.FC = () => {
    const [volume, setVolume] = useState(100); // 0 – 100
    const [muted, setMuted] = useState(false);

    // Sync slider based on first media element found
    useEffect(() => {
        const mediaEls = Array.from(
            document.querySelectorAll<HTMLMediaElement>("audio, video")
        );
        if (mediaEls.length) {
            setVolume(mediaEls[0].volume * 100);
            setMuted(mediaEls[0].muted);
        } else {
            const w = window as any;
            if (w.__waveSurfers && w.__waveSurfers.length) {
                setVolume(w.__waveSurfers[0].getVolume() * 100);
                setMuted(w.__waveSurfers[0].getVolume() === 0);
            }
        }
    }, []);

    // Global variable for TTS or other components
    useEffect(() => {
        const gVol = muted ? 0 : volume / 100;
        (window as any).__globalVolume = gVol;
        window.dispatchEvent(new CustomEvent("global-volume-change", { detail: { volume: gVol, muted } }));
    }, [volume, muted]);

    // Apply changes to all media elements
    useEffect(() => {
        const mediaEls = Array.from(
            document.querySelectorAll<HTMLMediaElement>("audio, video")
        );
        mediaEls.forEach((el) => {
            el.volume = volume / 100;
            el.muted = muted;
        });
        // WaveSurfer instances
        const w = window as any;
        if (w.__waveSurfers) {
            (w.__waveSurfers as any[]).forEach((ws) => {
                try {
                    if (typeof ws.setMute === "function") {
                        ws.setMute(muted);
                    }
                    if (typeof ws.setVolume === "function") {
                        ws.setVolume(muted ? 0 : volume / 100);
                    }
                } catch {}
            });
        }
    }, [volume, muted]);

    const handleSliderChange = (_: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        setVolume(value as number);
        if (value === 0) setMuted(true);
        else if (muted) setMuted(false);
    };

    const toggleMute = () => {
        setMuted((prev) => !prev);
        if (!muted && volume === 0) {
            setVolume(100); // restore volume when unmuting from 0
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 h-40 mt-6">
            <Slider
                orientation="vertical"
                value={muted ? 0 : volume}
                onChange={handleSliderChange}
                min={0}
                max={100}
                sx={{
                    color: "#001f3f", // custom navy
                }}
            />
            <IconButton onClick={toggleMute} sx={{ color: "#001f3f" }}>
                {muted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
        </div>
    );
};

export default AudioControl;
