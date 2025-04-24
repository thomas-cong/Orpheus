import React from "react";
const PatientList = (props: {
    patients: any;
    setFocusedPatientID: (patient: any) => void;
}) => {
    const renderPatients = () => {
        return props.patients.map((patient: any) => (
            <div
                key={patient._id}
                className="flex flex-col w-full px-4 py-2 bg-seasalt shadow-md mb-2 rounded-lg hover:border-2 hover:border-orange cursor-pointer"
                onClick={() => {
                    console.log(patient.patientID);
                    props.setFocusedPatientID(patient.patientID);
                }}
            >
                <div className="flex flex-row items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">
                        {patient.firstName} {patient.lastName}
                    </h3>
                    <span className="text-gray-600 text-xs">
                        {patient.patientID}
                    </span>
                </div>
                <div className="flex flex-row justify-between">
                    <span className="text-gray-600 mr-2">
                        DOB: {patient.DOB}
                    </span>
                    <span className="text-gray-600 mr-2">
                        Edu: {patient.educationLevel}
                    </span>
                    <span className="text-gray-600">
                        Eth: {patient.ethnicity}
                    </span>
                </div>
            </div>
        ));
    };
    return (
        <div className="flex flex-col w-full px-4 py-2 bg-seasalt shadow-md rounded-lg m-2 h-96">
            <h2 className="text-lg font-bold mb-2">Patient List</h2>
            <div className="overflow-y-auto">
                {props.patients && props.patients.length > 0 ? (
                    renderPatients()
                ) : (
                    <p className="text-gray-600">
                        No patients found. Try searching with different
                        criteria.
                    </p>
                )}
            </div>
        </div>
    );
};
export default PatientList;
