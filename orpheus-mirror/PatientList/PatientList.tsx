import React from "react";
const PatientList = (props: {
    patients: any;
    setFocusedPatient: (patient: any) => void;
}) => {
    const renderPatients = () => {
        return props.patients.map((patient: any) => (
            <div
                key={patient._id}
                className="flex flex-col w-full px-4 py-2 bg-seasalt shadow-md mb-2 rounded-lg hover:border-2 hover:border-orange cursor-pointer"
            >
                <h3
                    className="text-lg font-bold mb-2"
                    onClick={() => props.setFocusedPatient(patient)}
                >
                    {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-gray-600">{patient.patientID}</p>
                <p className="text-gray-600">{patient.DOB}</p>
                <p className="text-gray-600">{patient.educationLevel}</p>
                <p className="text-gray-600">{patient.ethnicity}</p>
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
