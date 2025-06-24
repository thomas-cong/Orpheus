import React, { useState, useEffect } from "react";

interface DelayTimerProps {
    duration: number;
    onTimerComplete: () => void;
}

const DelayTimer: React.FC<DelayTimerProps> = ({
    duration,
    onTimerComplete,
}) => {
    const [secondsLeft, setSecondsLeft] = useState(duration);
    const [timerComplete, setTimerComplete] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimerComplete(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 default-background">
            <h2 className="text-2xl font-semibold text-gray-800">
                Delay Period
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl">
                Please wait for {formatTime(duration)} before proceeding.
            </p>
            <div className="text-4xl font-bold text-blue-600">
                {formatTime(secondsLeft)}
            </div>
            {timerComplete && (
                <button onClick={onTimerComplete} className="button">
                    Continue
                </button>
            )}
        </div>
    );
};

export default DelayTimer;
