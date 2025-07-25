import React, { useEffect, useState } from "react";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
const TestInformation = (props: { testType: string }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [info, setInfo] = useState({
        title: "",
        description: "",
    });
    useEffect(() => {
        switch (props.testType) {
            case "RAVLT":
                setInfo({
                    title: "RAVLT",
                    description:
                        "You are currently taking the Rey Auditory Verbal Learning Test. It's designed to help evaluate memory and recall- early signs of potential brain injury",
                });
                
                break;
            case "RO":
                setInfo({
                    title: "RO",
                    description:
                        "You are currently taking the Rey Ostierreth Complex Figure Test. This helps evaluate visual-spatial ability and memory.",
                });
                
                break;
            default:
                setInfo({
                    title: "No test loaded yet",
                    description: "Please load a test to view information.",
                });
                setShowInfo(false);
        }
    }, [props.testType]);

    return (
        <div className="relative w-[100%] flex justify-center items-center">
            <PsychologyAltRoundedIcon
                onClick={() => setShowInfo(!showInfo)}
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                sx={{
                    color: "var(--custom-violet-300)",
                    fontSize: "2rem",
                }}
                className="hover:cursor-pointer"
            />
            {showInfo && (
                <div className="absolute right-1/2 bottom-1/2 transform translate-y-1/2 mr-2 p-4 default-background w-[300%] rounded-lg shadow-lg z-10 text-sm">
                    <p className="display-text mb-2">{info.title}</p>
                    <p>{info.description}</p>
                </div>
            )}
        </div>
    );
};

export default TestInformation;
