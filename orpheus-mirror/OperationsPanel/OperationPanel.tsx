import React from "react";
import RAVLTPanel from "./RAVLTPanel";
import ROPanel from "./ROPanel";

interface OperationPanelProps {
    patientID: string;
    trialID: string;
    focused: boolean;
}

const OperationPanel: React.FC<OperationPanelProps> = ({
    patientID,
    trialID,
    focused,
}) => {
    // Infer trial type prefix (e.g., RAVLT-123 -> RAVLT)
    const trialType = React.useMemo(
        () => (trialID ? trialID.split("-")[0].toUpperCase() : ""),
        [trialID]
    );

    const renderPanel = () => {
        switch (trialType) {
            case "RAVLT":
                return (
                    <RAVLTPanel
                        patientID={patientID}
                        trialID={trialID}
                        focused={focused}
                    />
                );
            case "RO":
                return (
                    <ROPanel
                        patientID={patientID}
                        trialID={trialID}
                        focused={focused}
                    />
                );
            default:
                return (
                    <div className="text-gray-400">
                        No operations available for this trial type.
                    </div>
                );
        }
    };

    return <div className="space-y-4">{renderPanel()}</div>;
};

export default OperationPanel;
