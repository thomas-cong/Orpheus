import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowCircleUpTwoToneIcon from "@mui/icons-material/ArrowCircleUpTwoTone";
const TrialIdInput = () => {
    const [trialID, setTrialID] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trialID) {
            setError("Please enter a trial ID.");
            return;
        }
        const trialType = trialID.split("-")[0];
        if (!trialType) {
            setError("Invalid trial ID format.");
            return;
        }
        setError("");
        navigate(`/testing/${trialID}`);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-2"
        >
            <div className="flex items-center w-[60vw] min-w-[220px] bg-white rounded-lg px-2">
                <input
                    className="flex-1 p-2 bg-transparent outline-none"
                    type="text"
                    placeholder="Enter trial ID"
                    value={trialID}
                    onChange={(e) => setTrialID(e.target.value)}
                />
                <ArrowCircleUpTwoToneIcon
                    sx={{
                        color: "var(--custom-navy-200)",
                        fontSize: "2rem",
                        opacity: 1,
                        pointerEvents: "auto",
                    }}
                    className="hover:cursor-pointer ml-2"
                    onClick={handleSubmit}
                />
            </div>
            <div className="min-h-[1.5em] text-xs mt-1 flex items-center justify-center">
                {error ? <span className="text-red-500">{error}</span> : null}
            </div>
        </form>
    );
};

const LandingPage = () => {
    return (
        <>
            <ShaderGradientCanvas
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                }}
            >
                <ShaderGradient
                    control="query"
                    urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23000072&color2=%239ad1d4&color3=%23f79f79&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=2&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.5&uFrequency=0&uSpeed=0.3&uStrength=0.7&uTime=8&wireframe=false"
                />
            </ShaderGradientCanvas>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-4xl text-white mb-2">Welcome to</h1>
                    <p className="text-white text-8xl font-bold mb-6">
                        Orpheus
                    </p>
                </div>
                <div className="mt-2 flex flex-col items-center justify-center w-full gap-4">
                    <div className="flex flex-col items-center justify-center gap-2 mt-6">
                        <TrialIdInput />
                    </div>
                </div>
            </div>
        </>
    );
};
export default LandingPage;
