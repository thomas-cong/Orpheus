import { useState } from "react";
const DemographicInput = ({
    setDemographicsCollected,
}: {
    setDemographicsCollected: (demographicsCollected: boolean) => void;
}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [education, setEducation] = useState("");
    const [ethnicity, setEthnicity] = useState("");
    const submit = () => {
        console.log("Submitted");
        const json = {
            firstName,
            lastName,
            age,
            education,
            ethnicity,
        };
        console.log(json);
        setDemographicsCollected(true);
    };
    return (
        <div className="max-w-xl aspect-[3/2] drop-shadow-[20px_20px_8px_rgba(0,0,0,0.2)] rounded-lg bg-honeydew flex flex-col items-center">
            <div className="flex w-full justify-between mb-4 mt-4">
                <input
                    className="w-45/100"
                    type="text"
                    placeholder="First Name"
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    className="w-45/100"
                    type="text"
                    placeholder="Last Name"
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>
            <input
                className="w-90/100"
                type="number"
                placeholder="Age"
                onChange={(e) => setAge(e.target.value)}
            />
            <select
                className="w-90/100"
                onChange={(e) => setEducation(e.target.value)}
            >
                <option value="">Select Education Level</option>
                <option value="Primary">Primary/Middle School</option>
                <option value="HS">High School</option>
                <option value="College">College</option>
                <option value="Grad">Graduate School</option>
                <option value="Other">Other</option>
            </select>
            <select
                className="w-90/100"
                onChange={(e) => setEthnicity(e.target.value)}
            >
                <option value="">Select Ethnicity</option>
                <option value="Hispanic">Hispanic</option>
                <option value="Non-Hispanic">Non-Hispanic</option>
            </select>
            <button
                className="bg-cerulean text-eblack h-15/100 w-50/100 rounded-lg p-2 text-center mt-4"
                onClick={submit}
            >
                Submit
            </button>
        </div>
    );
};

export default DemographicInput;
