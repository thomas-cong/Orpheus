import React from "react";
import HelpHover from "./HelpHover";
import TestInformation from "./TestInformation";

const UtilityBar = (props: { testType: string }) => {
    return (
        <div
            className="
        font-funnel-sans 
        flex flex-col items-center justify-center bg-seasalt w-[8%] h-[90vh]
         rounded-lg m-4 drop-shadow-lg"
        >
            <HelpHover />
            <TestInformation testType={props.testType} />
        </div>
    );
};
export default UtilityBar;
