import React from "react";
import { get } from "../../global-files/utilities";

const GenerateWordsButton = (props: {
    numWords: number;
    words: string[];
    setWords: (words: string[]) => void;
    onClick: () => void;
    wordBlacklist?: string[];
}) => {
    const generateWords = async () => {
        try {
            const { words } = await get("/api/testHelper/generateWords", {
                numWords: props.numWords,
                wordBlacklist: props.wordBlacklist,
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
        <button className="button" onClick={onClicked}>
            Generate Words
        </button>
    );
};

export default GenerateWordsButton;
