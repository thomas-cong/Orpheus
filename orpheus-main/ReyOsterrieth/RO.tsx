import React, { useState } from "react";
import FreehandCanvas from "../DrawingInput/FreehandCanvas";

const RO = () => {
    const [condition, setCondition] = useState("Copy");
    // either Copy, Immediate, Delayed
    return (
        <>
            <h1>RO</h1>
            <FreehandCanvas />
        </>
    );
};
export default RO;
