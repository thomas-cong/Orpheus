import React, { useState } from "react";

const SubmissionButton = (props: {
    setCondition: (condition: number) => void;
    condition: number;
}) => {
    const [confirm, setConfirm] = useState(false);
    return (
        <>
            {!confirm && <div onClick={() => setConfirm(true)}>Submit</div>}
            {confirm && (
                <div onClick={() => props.setCondition(props.condition + 1)}>
                    Confirm
                </div>
            )}
        </>
    );
};
export default SubmissionButton;
