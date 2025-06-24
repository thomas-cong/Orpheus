import React from "react";

const TestProgressionButton = (props: {
    onClick: () => void;
    text: string;
}) => {
    return (
        <button className="button" onClick={props.onClick}>
            {props.text}
        </button>
    );
};

export default TestProgressionButton;
