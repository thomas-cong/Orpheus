import React, { useState } from "react";

const HelpHover = () => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="relative w-[100%] flex justify-center items-center">
            <div
                className="font-funnel-sans text-2xl cursor-pointer hover:text-orange transition-colors duration-300"
                onClick={() => setShowHelp(!showHelp)}
                onMouseEnter={() => setShowHelp(true)}
                onMouseLeave={() => setShowHelp(false)}
            >
                ?
            </div>
            {showHelp && (
                <div className="absolute right-1/2 bottom-1/2 transform translate-y-1/2 mr-2 p-4 bg-seasalt text-darkblue w-[300%] rounded-lg shadow-lg z-10 text-sm">
                    <p className="text-darkblue font-bold mb-2">Orpheus</p>
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
