import React, { useState } from "react";
import FreehandCanvas from "../DrawingInput/FreehandCanvas";
import SubmissionButton from "./SubmissionButton";

const RO = () => {
    const [condition, setCondition] = useState(0);
    // either 0: Copy, 1: Immediate, 2: Delayed
    return (
        <>
            <h1>RO</h1>
            <FreehandCanvas />
            {condition < 3 && (
                <SubmissionButton
                    setCondition={setCondition}
                    condition={condition}
                />
            )}
        </>
    );
};
export default RO;
