import { TextToSpeech } from "tts-react";
import "./TTSAudioComponent.css";
import { useState } from "react";

const TTSAudioComponent = (props: {
    wordArray: string[];
    onStart: () => void;
    countdown: number;
    rate: number;
    onEnd: () => void;
}) => {
    const [beenClicked, setBeenClicked] = useState(false);
    const onTTSStart = () => {
        setBeenClicked(true);
        props.onStart();
        console.log("TTS started");
    };
    const onTTSEnd = () => {
        setBeenClicked(false);
        console.log("TTS ended");
        props.onEnd();
    };
    let countDown = [];
    for (let i = props.countdown; i > 0; i--) {
        countDown.push(i);
    }
    const finalTTSArray = [...countDown, ...props.wordArray];
    return (
        <>
            <div className={beenClicked ? "unclickableButton" : ""}>
                <TextToSpeech
                    markTextAsSpoken
                    rate={props.rate}
                    align="horizontal"
                    onStart={onTTSStart}
                    onEnd={onTTSEnd}
                >
                    {finalTTSArray.map((word) => (
                        <p className="hideText" key={word}>
                            {word + ",,"}
                        </p>
                    ))}
                </TextToSpeech>
            </div>
        </>
    );
};

export default TTSAudioComponent;
