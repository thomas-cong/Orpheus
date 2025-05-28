import React from "react";
import HelpHover from "./HelpHover";

const UtilityBar = () => {
    return (
        <div
            className="
        font-funnel-sans 
        flex items-center justify-center bg-seasalt w-[8%] h-[90vh]
         rounded-lg m-4 drop-shadow-lg"
        >
            <HelpHover />
        </div>
    );
};
export default UtilityBar;
