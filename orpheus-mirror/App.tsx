import { useState } from "react";
import "../global-files/index.css";
import { Outlet, Link, useLocation } from "react-router-dom";
import { createTrial } from "./utilities";

const App = () => {
    const location = useLocation();
    const [trialIds, setTrialIds] = useState<{[key: string]: string}>({});
    const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
    const [error, setError] = useState<string | null>(null);

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
                            <Link
                                to="/playground"
                                className="block w-full py-3 px-4 bg-orange-500 hover:bg-orange-400 text-white text-center font-medium rounded-md transition duration-200"
                            >
                                Playground
                            </Link>

                            <div className="mt-8 border-t border-gray-700 pt-6">
                                <h2 className="text-xl font-semibold mb-4 text-center">Create New Trial</h2>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {/* RAVLT Trial Creation Button */}
                                    <div className="p-4 border border-gray-700 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-lg font-medium">RAVLT Test</h3>
                                            <button 
                                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded text-white text-sm font-medium transition-colors"
                                                onClick={async () => {
                                                    try {
                                                        setIsLoading(prev => ({ ...prev, ravlt: true }));
                                                        setError(null);
                                                        const data = await createTrial('RAVLT');
                                                        setTrialIds(prev => ({ ...prev, ravlt: data.trialID }));
                                                    } catch (err) {
                                                        setError(err instanceof Error ? err.message : 'Failed to create trial');
                                                        console.error(err);
                                                    } finally {
                                                        setIsLoading(prev => ({ ...prev, ravlt: false }));
                                                    }
                                                }}
                                                disabled={isLoading.ravlt}
                                            >
                                                {isLoading.ravlt ? 'Creating...' : 'Create Trial'}
                                            </button>
                                        </div>
                                        {trialIds.ravlt && (
                                            <div className="mt-2 p-2 bg-gray-700 rounded flex items-center justify-between">
                                                <span className="font-mono text-sm">{trialIds.ravlt}</span>
                                                <button 
                                                    className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded"
                                                    onClick={() => navigator.clipboard.writeText(trialIds.ravlt)}
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* RO Trial Creation Button */}
                                    <div className="p-4 border border-gray-700 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-lg font-medium">RO Test</h3>
                                            <button 
                                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded text-white text-sm font-medium transition-colors"
                                                onClick={async () => {
                                                    try {
                                                        setIsLoading(prev => ({ ...prev, ro: true }));
                                                        setError(null);
                                                        const data = await createTrial('RO');
                                                        setTrialIds(prev => ({ ...prev, ro: data.trialID }));
                                                    } catch (err) {
                                                        setError(err instanceof Error ? err.message : 'Failed to create trial');
                                                        console.error(err);
                                                    } finally {
                                                        setIsLoading(prev => ({ ...prev, ro: false }));
                                                    }
                                                }}
                                                disabled={isLoading.ro}
                                            >
                                                {isLoading.ro ? 'Creating...' : 'Create Trial'}
                                            </button>
                                        </div>
                                        {trialIds.ro && (
                                            <div className="mt-2 p-2 bg-gray-700 rounded flex items-center justify-between">
                                                <span className="font-mono text-sm">{trialIds.ro}</span>
                                                <button 
                                                    className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded"
                                                    onClick={() => navigator.clipboard.writeText(trialIds.ro)}
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm text-red-200">
                                        {error}
                                    </div>
                                )}
                            </div>
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
