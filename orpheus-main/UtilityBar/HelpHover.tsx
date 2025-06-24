import React, { useState } from "react";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
const HelpHover = () => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="relative w-[100%] flex justify-center items-center">
            <HelpOutlineRoundedIcon
                sx={{ color: "var(--custom-violet-200)", fontSize: "2rem" }}
                className="hover:cursor-pointer"
                onClick={() => setShowHelp(!showHelp)}
                onMouseEnter={() => setShowHelp(true)}
                onMouseLeave={() => setShowHelp(false)}
            />
            {showHelp && (
                <div className="absolute right-1/2 bottom-1/2 transform translate-y-1/2 mr-2 p-4 default-background text-darkblue w-[300%] rounded-lg shadow-lg z-10 text-sm">
                    <p className="display-text mb-2">Orpheus</p>
                    <p>
                        Orpheus is a cognitive assessment platform designed to
                        deliver digitized tests in the comfort of your own home.
                    </p>
                    <p className="mt-2">
                        Any questions? Please email{" "}
                        <span className="text-orange">fish@fish.com</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default HelpHover;
