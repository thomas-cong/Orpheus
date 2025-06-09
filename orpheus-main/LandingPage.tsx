import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import React from "react";
import { Link } from "react-router-dom";
import FreehandCanvas from "./DrawingInput/FreehandCanvas";
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
                <div className="mt-2 flex justify-center w-full">
                    <Link
                        to="/testing"
                        className="text-white font-normal text-xl p-2 cursor-pointer font-funnel-sans link-underline text-center"
                    >
                        Start Testing
                    </Link>
                </div>
            </div>
        </>
    );
};
export default LandingPage;
