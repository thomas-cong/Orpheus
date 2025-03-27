import { useState, useEffect } from "react";

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
    const finalArray: string[] = [];
    for (let i = countdown; i > 0; i--) {
        finalArray.push(i.toString());
    }
    finalArray.push(...wordArray);
    useEffect(() => {
        if (spokenWord === null) return;
        console.log("spoken word: ", finalArray[spokenWord]);
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
        window.speechSynthesis.cancel();
        setSpokenWord(0);
        onStart?.();
    };
    return (
        <button
            className="bg-cerulean text-eblack h-10 w-15"
            disabled={started}
            onClick={startTTS}
        >
            Play
        </button>
    );
};
export default TTSAudioComponent;
