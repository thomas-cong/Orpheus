import React from "react";
import HelpHover from "./HelpHover";
import TestInformation from "./TestInformation";
import AudioControl from "./AudioControl";

const UtilityBar = (props: { testType: string }) => {
    return (
        <div
            className="
        font-funnel-sans 
        flex flex-col items-center justify-center default-background w-[8%] h-[40vh]
         rounded-lg m-4 drop-shadow-lg"
        >
            <HelpHover />
            <TestInformation testType={props.testType} />
            <AudioControl />
        </div>
    );
};
export default UtilityBar;
