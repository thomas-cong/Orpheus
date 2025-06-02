import React from "react";

const InstructionDisplay = (props: { instructions: string }) => {
    return (
        <div className="text-eblack text-center m-4">{props.instructions}</div>
    );
};

export default InstructionDisplay;
