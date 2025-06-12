import React, { useState } from "react";

const SubmissionButton = (props: { onConfirm: () => void }) => {
    const [confirm, setConfirm] = useState(false);
    return (
        <div className="flex justify-center items-center">
            {!confirm && (
                <div
                    className="cursor-pointer rounded-md bg-darkblue text-white text-center w-[6%] h-[3%]"
                    onClick={() => setConfirm(true)}
                >
                    Submit
                </div>
            )}
            {confirm && (
                <div
                    className="cursor-pointer rounded-md bg-darkblue text-white text-center w-[6%] h-[3%]"
                    onClick={() => {
                        props.onConfirm();
                        setConfirm(false);
                    }}
                >
                    Confirm
                </div>
            )}
        </div>
    );
};
export default SubmissionButton;
