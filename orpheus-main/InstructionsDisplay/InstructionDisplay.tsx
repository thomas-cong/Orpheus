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
        <div className="default-background">
            {title && <h3 className="display-text p-2 mb-[-2px]">{title}</h3>}
            <div className="body-text p-2">{instructions}</div>
        </div>
    );
};

export default InstructionDisplay;
