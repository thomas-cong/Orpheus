import React from "react";
import "../global-files/index.css";
import { Outlet, Link, useLocation } from "react-router-dom";

const App = () => {
    const location = useLocation();

    // Only show the navigation options on the root path
    const isRootPath = location.pathname === "/";

    return (
        <div className="app-container min-h-screen bg-gray-900 text-white">
            {isRootPath ? (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">
                            Psychiatric Tests Platform
                        </h1>
                        <div className="space-y-4">
                            <Link
                                to="/portal"
                                className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-center font-medium rounded-md transition duration-200"
                            >
                                Patient Portal
                            </Link>
                            <Link
                                to="/testing"
                                className="block w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white text-center font-medium rounded-md transition duration-200"
                            >
                                Testing Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    );
};
export default App;
