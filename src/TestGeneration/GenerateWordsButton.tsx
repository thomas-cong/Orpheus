const GenerateWordsButton = (props: {
    numWords: number;
    words: string[];
    setWords: (words: string[]) => void;
    onClick: () => void;
}) => {
    const generateWords = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/generateWords?numWords=${props.numWords}`
            );
            const data = await response.json();
            props.setWords(data.words);
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
