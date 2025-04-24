import { useState, useEffect } from "react";
import CountdownDisplay from "./CountdownDisplay";
import React from "react";

// takes in a word array, and a length of countdown (int), an delay between words (seconds)
// returns a button that, when clicked, plays the words in the word array.
const TTSAudioComponent = ({
    wordArray,
    countdown,
    delay,
    onEnd,
    onStart,
}: {
    wordArray: string[];
    countdown: number;
    delay: number;
    onEnd?: () => void;
    onStart?: () => void;
}) => {
    const [started, setStarted] = useState(false);
    const [spokenWord, setSpokenWord] = useState<number | null>(null);
    const [currentCount, setCurrentCount] = useState<number | null>(null);
    const finalArray: string[] = [];
    for (let i = countdown; i > 0; i--) {
        finalArray.push(i.toString());
    }
    finalArray.push(...wordArray);
    useEffect(() => {
        if (spokenWord === null) return;
        console.log("spoken word: ", finalArray[spokenWord]);
        // Update countdown display if we're in the countdown phase
        if (spokenWord < countdown) {
            setCurrentCount(countdown - spokenWord);
        } else {
            setCurrentCount(null);
        }
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(finalArray[spokenWord]);
        synth.speak(u);
        if (spokenWord < finalArray.length - 1) {
            setTimeout(() => {
                setSpokenWord((prev) => (prev !== null ? prev + 1 : 0));
            }, delay * 1000);
        }
        if (spokenWord === finalArray.length - 1 && onEnd) {
            onEnd();
        }
        return () => {};
    }, [spokenWord]);
    const startTTS = () => {
        setStarted(true);
        setCurrentCount(countdown);
        window.speechSynthesis.cancel();
        setSpokenWord(0);
        onStart?.();
    };
    return (
        <div className="flex flex-col items-center space-y-4">
             {currentCount !== null && (
                 <CountdownDisplay count={currentCount} />
             )}
             <button
                 className="bg-cerulean text-eblack h-10 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
                 disabled={started}
                 onClick={startTTS}
             >
                 Play
             </button>
         </div>
    );
};
export default TTSAudioComponent;
