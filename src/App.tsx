import RAVLTTest from "./RAVLTTest/RAVLTTest";
import "./index.css";
import DemographicInput from "./PatientInfo/DemographicInput";
import { useState } from "react";
import TestSelection from "./PatientInfo/TestSelection";
const App = () => {
    const [patientID, setPatientID] = useState("");
    const [trialID, setTrialID] = useState("");
    const [test, setTest] = useState("");
    const [demographicsCollected, setDemographicsCollected] = useState(false);
    return (
        <div className="bg-floralwhite min-h-screen flex items-center justify-center">
            {test === "" && (
                <>
                    {demographicsCollected ? (
                        <TestSelection setTest={setTest} />
                    ) : (
                        <DemographicInput
                            setDemographicsCollected={setDemographicsCollected}
                        />
                    )}
                </>
            )}
            {test === "RAVLT" && (
                <RAVLTTest patientID={patientID} trialID={trialID} />
            )}
        </div>
    );
};

export default App;
