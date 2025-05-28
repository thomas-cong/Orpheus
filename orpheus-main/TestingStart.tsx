import RAVLT from "./RAVLT/RAVLT";
import "../global-files/index.css";
import DemographicInput from "./PatientInfo/DemographicInput";
import { useState } from "react";
import TestSelection from "./PatientInfo/TestSelection";
import { PatientProvider } from "./context/PatientContext";
import React from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
const TestingStart = () => {
    const [test, setTest] = useState("");
    const [demographicsCollected, setDemographicsCollected] = useState(false);
    return (
        <PatientProvider>
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
            <div className="min-h-screen flex items-center justify-center">
                {test === "" && (
                    <>
                        {demographicsCollected ? (
                            <TestSelection setTest={setTest} />
                        ) : (
                            <DemographicInput
                                setDemographicsCollected={
                                    setDemographicsCollected
                                }
                            />
                        )}
                    </>
                )}
                {test === "RAVLT" && (
                    <RAVLT
                        setTest={setTest}
                        setDemographicsCollected={setDemographicsCollected}
                    />
                )}
            </div>
        </PatientProvider>
    );
};

export default TestingStart;
