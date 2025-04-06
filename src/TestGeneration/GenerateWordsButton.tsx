import { get } from "../utilities";

const GenerateWordsButton = (props: {
    numWords: number;
    words: string[];
    setWords: (words: string[]) => void;
    onClick: () => void;
}) => {
    const generateWords = async () => {
        try {
            const { words } = await get("/api/generateWords", {
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
        <button className="bg-cerulean text-eblack" onClick={onClicked}>
            Generate Words
        </button>
    );
};

export default GenerateWordsButton;
