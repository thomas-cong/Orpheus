import React, { useEffect, useState } from "react";
import { get, post } from "../../global-files/utilities";

interface ROPanelProps {
    patientID: string;
    trialID: string;
    focused: boolean;
}

const ROPanel: React.FC<ROPanelProps> = ({ patientID, trialID, focused }) => {
    const [imageURLs, setImageURLs] = useState<string[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [scores, setScores] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [modalUrl, setModalUrl] = useState<string | null>(null);

    // Helper to sanitize container name (must match backend logic)
    const sanitizeForAzure = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    // Fetch images whenever trialID changes
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setModalUrl(null);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    useEffect(() => {
        if (!trialID) return;
        const fetchImages = async () => {
            setLoadingImages(true);
            setStatusMsg("");
            try {
                const resp = await get(
                    "/api/imageStorage/getContainerFileURLs",
                    {
                        containerName: sanitizeForAzure(trialID),
                    }
                );
                const urls: string[] = (resp.urls || [])
                    .sort((a: any, b: any) => a.blobName.localeCompare(b.blobName))
                    .map((u: any) => u.url);
                setImageURLs(urls);

                // Try to fetch existing results
                try {
                    const res = await get("/api/ro/getResultsByTrialID", { trialID });
                    if (res && Array.isArray(res.similarityArray)) {
                        // Ensure array length matches images
                        const incoming = res.similarityArray as number[];
                        const padded = [...incoming];
                        while (padded.length < urls.length) padded.push(NaN);
                        setScores(padded.slice(0, urls.length));
                    } else {
                        setScores(Array(urls.length).fill(NaN));
                    }
                } catch {
                    // No existing results
                    setScores(Array(urls.length).fill(NaN));
                }

                setSelectedIdx(null);
            } catch (err) {
                console.error("Error fetching images:", err);
                setStatusMsg("Failed to load images");
            } finally {
                setLoadingImages(false);
            }
        };
        fetchImages();
    }, [trialID]);

    const handleScoreChange = (idx: number, value: string) => {
        if (idx < 0 || idx >= scores.length) return;
        const num = parseFloat(value);
        setScores((prev) => {
            const copy = [...prev];
            copy[idx] = isNaN(num) ? NaN : num;
            return copy;
        });
    };

    const allScoresValid = scores.length > 0 && scores.every((s) => !isNaN(s));

    const saveResults = async () => {
        if (!allScoresValid || !trialID || !patientID) return;
        setSaving(true);
        setStatusMsg("Saving results...");
        try {
            await post("/api/ro/addResults", {
                patientID,
                trialID,
                imageBin: trialID,
                similarityArray: scores,
            });
            setStatusMsg("Results saved successfully!");
        setEditModal(false);
        } catch (err) {
            console.error("Error saving results:", err);
            setStatusMsg("Error saving results");
        } finally {
            setSaving(false);
            setTimeout(() => setStatusMsg(""), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* --- Scores Header --- */}
            {scores.length > 0 && (
                <div className="flex flex-col md:flex-row md:justify-center gap-4">
                    {scores.map((val, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1 min-w-[140px]"
                        >
                            <span className="text-gray-400 text-sm mb-1">Score {idx + 1}</span>
                            <span className="text-2xl font-bold text-gray-100">
                                {isNaN(val) ? "-" : val}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* --- Images Grid --- */}
            {loadingImages ? (
                <div className="text-gray-300 animate-pulse">Loading images...</div>
            ) : imageURLs.length === 0 ? (
                <div className="text-gray-400">No images uploaded for this trial.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {imageURLs.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={`RO drawing ${idx + 1}`}
                            className="w-full object-contain h-64 border border-gray-700 rounded-lg shadow cursor-pointer transition-transform hover:scale-105"
                            onClick={() => {
                                setSelectedIdx(idx);
                                setModalUrl(url);
                            }}
                            style={{ outline: selectedIdx === idx ? "3px solid #3B82F6" : "none" }}
                        />
                    ))}
                </div>
            )}

            {statusMsg && <div className="text-sm text-blue-400">{statusMsg}</div>}

            {/* --- Update button bottom --- */}
            {focused && (
                <button
                    onClick={() => setEditModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
                >
                    Update RO Results
                </button>
            )}

            {/* --- Edit Scores Modal --- */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl space-y-6" onClick={(e)=>e.stopPropagation()}>
                        <h2 className="text-xl text-white font-semibold mb-4 text-center">Update RO Results</h2>
                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 justify-center">
                            {imageURLs.map((url, idx)=>(
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <img
                                        src={url}
                                        alt={`img-${idx}`}
                                        className="max-h-64 object-contain border border-gray-700 rounded mb-2 cursor-pointer hover:scale-105 transition-transform"
                                        onClick={()=>setModalUrl(url)}
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={isNaN(scores[idx]) ? "" : scores[idx]}
                                        onChange={(e)=>handleScoreChange(idx,e.target.value)}
                                        className="w-full bg-gray-800 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={()=>setEditModal(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                            <button
                                onClick={saveResults}
                                disabled={!allScoresValid || saving}
                                className={`${!allScoresValid || saving ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded`}
                            >{saving ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                    <button className="absolute top-4 right-4 text-white text-3xl font-bold" onClick={()=>setEditModal(false)}>×</button>
                </div>
            )}

            {/* --- Image Zoom Modal (rendered last for proper stacking) --- */}
            {modalUrl && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/90"
                    onClick={() => setModalUrl(null)}
                >
                    <img
                        src={modalUrl}
                        alt="Large RO drawing"
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
                        onClick={() => setModalUrl(null)}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default ROPanel;
