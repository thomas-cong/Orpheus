const TestProgressionButton = (props: {
    onClick: () => void;
    text: string;
}) => {
    return (
        <button
            className="bg-cerulean text-eblack h-10 w-15 animate-(--button-pulse-size) rounded-lg p-2"
            onClick={props.onClick}
        >
            {props.text}
        </button>
    );
};

export default TestProgressionButton;
