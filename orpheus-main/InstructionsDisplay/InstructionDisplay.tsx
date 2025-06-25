import React from "react";

interface InstructionDisplayProps {
    title?: string;
    instructions: string;
}

const InstructionDisplay = ({
    title,
    instructions,
}: InstructionDisplayProps) => {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            {title && <h2 className="display-text text-3xl">{title}</h2>}
            <p className="body-text max-w-md">{instructions}</p>
        </div>
    );
};

export default InstructionDisplay;
