import RAVLT from "./RAVLT/RAVLT";
import "../global-files/index.css";
import DemographicInput from "./PatientInfo/DemographicInput";
import { useState, useEffect } from "react";
import { PatientProvider } from "./context/PatientContext";
import React from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import UtilityBar from "./UtilityBar/UtilityBar";
import { get } from "../global-files/utilities";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestingStart = () => {
    const [test, setTest] = useState("");
    const [demographicsCollected, setDemographicsCollected] = useState(false);
    const [trialID, setTrialID] = useState("");
    const [trialFound, setTrialFound] = useState(false);
    const checkTrialExistence = (trialID: string, trialType: string) => {
        get(`/api/trials/get${trialType}TrialByTrialID`, {
            trialID: trialID,
        }).then((result) => {
            if (result.msg === "Trial not found") {
                toast.error(`${trialType} Trial not found`);
                return false;
            } else {
                if (result.trial.status == "incomplete") {
                    toast.success(`${trialType} Trial found`);
                    setTrialFound(true);
                    setTest(trialType);
                    return true;
                } else {
                    toast.error(`${trialType} Trial not found`);
                    return false;
                }
            }
        });
    };
    const onSubmitTrialId = async () => {
        const testTypes = ["RAVLT"];
        if (trialID) {
            testTypes.forEach((testType) => {
                checkTrialExistence(trialID, testType);
            });
        }
    };

    useEffect(() => {
        console.log(
            "State updated - trialFound:",
            trialFound,
            "test:",
            test,
            "demographicsCollected:",
            demographicsCollected
        );
    }, [trialFound, test, demographicsCollected]);
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
                className="pointer-events-none"
            >
                <ShaderGradient
                    control="query"
                    urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.1&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%2300f7ff&color2=%23120cb0&color3=%230000a5&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=30&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=2.9&positionX=-1.4&positionY=0&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.3&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.3&uFrequency=5.5&uSpeed=0.1&uStrength=4&uTime=2&wireframe=false"
                />
            </ShaderGradientCanvas>
            {trialFound && (
                <div className="font-funnel-sans min-h-screen flex items-center justify-start pl-4">
                    <div className="h-[90vh] w-[92%] flex flex-col items-center justify-center bg-seasalt rounded-lg drop-shadow-lg">
                        <>
                            {!demographicsCollected && (
                                <DemographicInput
                                    setDemographicsCollected={
                                        setDemographicsCollected
                                    }
                                />
                            )}
                        </>
                        {test === "RAVLT" && demographicsCollected && (
                            <>
                                <RAVLT
                                    setTest={setTest}
                                    setDemographicsCollected={
                                        setDemographicsCollected
                                    }
                                    trialID={trialID}
                                />
                            </>
                        )}
                    </div>
                    <UtilityBar />
                </div>
            )}
            {!trialFound && (
                <div className="font-funnel-sans min-h-screen flex items-center justify-center">
                    <input
                        type="text"
                        placeholder="Enter trial ID"
                        value={trialID}
                        onChange={(e) => setTrialID(e.target.value)}
                    />
                    <button
                        className="bg-darkblue hover:bg-cerulean text-white font-bold py-2 px-4 rounded"
                        onClick={onSubmitTrialId}
                    >
                        Submit
                    </button>
                </div>
            )}
        </PatientProvider>
    );
};

export default TestingStart;
