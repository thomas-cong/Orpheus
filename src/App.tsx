import RAVLTTest from "./RAVLTTest/RAVLTTest";
import "./index.css";
import DemographicInput from "./PatientInfo/DemographicInput";
import { useEffect, useState } from "react";
import TestSelection from "./PatientInfo/TestSelection";
import { PatientProvider } from "./context/PatientContext";
const App = () => {
    const [test, setTest] = useState("");
    const [demographicsCollected, setDemographicsCollected] = useState(false);
    return (
        <PatientProvider>
            <div className="bg-floralwhite min-h-screen flex items-center justify-center">
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
                {test === "RAVLT" && <RAVLTTest />}
            </div>
        </PatientProvider>
    );
};

export default App;
