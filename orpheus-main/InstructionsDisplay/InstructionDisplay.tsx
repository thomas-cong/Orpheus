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
        <div className="default-background rounded-lg p-4 mb-6 shadow-md">
            {title && (
                <h3 className="text-darkblue font-semibold text-lg mb-2">
                    {title}
                </h3>
            )}
            <div className="text-eblack text-md">{instructions}</div>
        </div>
    );
};

export default InstructionDisplay;
