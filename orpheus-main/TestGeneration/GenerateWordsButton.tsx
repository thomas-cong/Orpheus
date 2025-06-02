import React from "react";
import { get } from "../../global-files/utilities";

const GenerateWordsButton = (props: {
    numWords: number;
    words: string[];
    setWords: (words: string[]) => void;
    onClick: () => void;
}) => {
    const generateWords = async () => {
        try {
            const { words } = await get("/api/testHelper/generateWords", {
                numWords: props.numWords,
            });
            props.setWords(words);
        } catch (error) {
            console.error(error);
        }
    };
    const onClicked = () => {
        generateWords();
        props.onClick();
    };
    return (
        <button className="bg-darkblue text-white" onClick={onClicked}>
            Generate Words
        </button>
    );
};

export default GenerateWordsButton;
