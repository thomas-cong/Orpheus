import React, { useState } from "react";
import Copy from "./Copy";

const RO = ({
    setTest,
    setDemographicsCollected,
    trialID,
}: {
    setTest: (test: string) => void;
    setDemographicsCollected: (collected: boolean) => void;
    trialID: string;
}) => {
    const [condition, setCondition] = useState(0);
    // either 0: Copy, 1: Immediate, 2: Delayed
    return (
        <>
            <Copy />
        </>
    );
};
export default RO;
