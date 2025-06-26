import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { get } from "../../global-files/utilities";

export interface RAVLTResultsViewerHandle {
    fetchResults: () => void;
}

interface RAVLTResultsViewerProps {
    patientID: string;
    trialID: string;
}

const RAVLTResultsViewer = forwardRef<RAVLTResultsViewerHandle, RAVLTResultsViewerProps>(({ patientID, trialID }, ref) => {
    const [results, setResults] = useState<any | null>(null);
    const [audioURLs, setAudioURLs] = useState<Record<number, string>>({});
    const [rawJSON, setRawJSON] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Helper sub-components & constants
    const ScoreBox = ({ label, value }: { label: string; value: any }) => (
        <div className="bg-gray-800 rounded p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-gray-100">{value ?? "-"}</p>
        </div>
    );

    const CycleAudio = ({ src }: { src: string }) => {
        const audioRef = React.useRef<HTMLAudioElement | null>(null);
        React.useEffect(() => {
            if (audioRef.current) {
                audioRef.current.load(); // force load metadata
            }
        }, [src]);
        return (
            <audio
                ref={audioRef}
                controls
                src={src}
                crossOrigin="anonymous"
                preload="metadata"
                onLoadedMetadata={e => {
                    const dur = e.currentTarget.duration;
                    console.log(`audio duration: ${dur}s`);
                    // if you want to display it, store it in state here
                }}
                className="mt-1 w-full max-w-xs"
            />
        );
    };

    const WordList = ({ words }: { words: string[] }) => (
        <div className="flex flex-wrap gap-2">
            {words && words.length > 0 ? (
                words.map((w, idx) => (
                    <span
                        key={idx}
                        className="px-2 py-1 bg-gray-700 rounded text-gray-100 text-sm"
                    >
                        {w}
                    </span>
                ))
            ) : (
                <span className="text-gray-400 text-sm">None</span>
            )}
        </div>
    );

    const cycleDefinitions = [
        { index: 0, label: "Cycle 1" },
        { index: 1, label: "Cycle 2" },
        { index: 2, label: "Cycle 3" },
        { index: 3, label: "Cycle 4" },
        { index: 4, label: "Interference" },
        { index: 5, label: "Recall" },
    ];

    // Helper to sanitize names for Azure Blob Storage (must match backend logic)
    const sanitizeForAzure = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    };

    const fetchResults = useCallback(async () => {
        if (!trialID) return;
        setLoading(true);
        setError("");
        console.log("Fetching results for trial ID:", trialID);
        try {
            // Get trial details to verify it exists
            const trialResp = await get("/api/ravlt/getTrialByTrialID", {
                trialID: trialID,
            });

            if (!trialResp.trial) {
                console.log("Trial not found");
                setError("Trial not found");
                return;
            }

            // Fetch RAVLT results using the new endpoint
            const resultsResp = await get(
                "/api/ravlt/getResultsByTrialID",
                {
                    trialID: trialID,
                }
            );

            if (!resultsResp) {
                console.log("No results found for this trial");
                setResults(null);
                setRawJSON("No RAVLT results found for this trial. Try computing results first.");
            } else {
                console.log("Results found:", resultsResp);
                setResults(resultsResp);

                // After getting results, fetch audio URLs for the container
                try {
                    const containerName = sanitizeForAzure(trialID);
                    const fileListResp = await get(
                        "/api/audioStorage/getContainerFileURLs",
                        { containerName }
                    );
                    if (fileListResp && fileListResp.urls) {
                        const urlMap: Record<number, string> = {};
                        (fileListResp.urls as Array<any>).forEach((f: any) => {
                            const match = f.blobName.match(/-(\d+)\.wav$/);
                            if (match) {
                                const idx = Number(match[1]);
                                // Some backend versions return container URL only; append blobName if missing
                                let fullUrl = f.url;
                                if (!fullUrl.includes(`/${f.blobName}`)) {
                                    const [base, query] = fullUrl.split("?");
                                    fullUrl = `${base}/${f.blobName}?${query}`;
                                }
                                urlMap[idx] = fullUrl;
                            }
                        });
                        // Use signed URLs directly; let <audio> handle the download
                        console.log(urlMap);
                        setAudioURLs(urlMap);
                    }
                } catch (err) {
                    console.error("Error fetching audio URLs", err);
                }
                setRawJSON(JSON.stringify(resultsResp, null, 2));
            }
        } catch (e) {
            console.error(e);
            setError(e as string || "Error fetching results");
        } finally {
            setLoading(false);
        }
    }, [patientID, trialID]);

    useImperativeHandle(ref, () => ({
        fetchResults,
    }));

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    if (loading)
        return (
            <p className="text-gray-300">Loading transcription & analysis...</p>
        );
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return results ? (
        <div className="space-y-6">
            {/* Score Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScoreBox label="Total Recall" value={results.totalRecallScore} />
                <ScoreBox
                    label="Similarity Index"
                    value={
                        typeof results.similarityIndex === "number"
                            ? results.similarityIndex.toFixed(2)
                            : results.similarityIndex
                    }
                />
                <ScoreBox
                    label="Semantic Similarity"
                    value={
                        typeof results.semanticSimilarityIndex === "number"
                            ? results.semanticSimilarityIndex.toFixed(2)
                            : results.semanticSimilarityIndex
                    }
                />
            </div>

            {/* Word Sets + Cycles Layout */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Test / Interference words */}
                <div className="md:w-1/2 flex flex-col items-center">
                    <h3 className="text-xl font-semibold text-gray-200 mb-3">Test Words</h3>
                    <WordList words={results.testWords} />

                    <h3 className="text-xl font-semibold text-gray-200 mt-4 mb-3">Interference Words</h3>
                    <WordList words={results.interferenceWords} />
                </div>

                {/* Right: Cycles */}
                <div className="md:w-1/2 flex flex-col items-center">
                    <h3 className="text-2xl font-semibold text-gray-200 mb-3">Cycles</h3>
                    <div className="space-y-3">
                        {cycleDefinitions.map((cycle) => {
                            const wordsInCycle =
                                results.transcribedWords?.filter((w: any) => w.fileIndex === cycle.index) ?? [];
                            const testSet = new Set(
                                (results.testWords as string[]).map((w: string) => w.toLowerCase())
                            );
                            const interferenceSet = new Set(
                                (results.interferenceWords as string[]).map((w: string) => w.toLowerCase())
                            );
                            return (
                                <div key={cycle.index}>
                                    <h4 className="text-sm text-gray-400 mb-1">{cycle.label}</h4>
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {wordsInCycle.map((w: any, idx: number) => {
                                            let colorClass = "bg-gray-700 text-gray-100";
                                            const lw = w.word.toLowerCase();
                                            if (testSet.has(lw)) colorClass = "bg-green-600 text-white";
                                            else if (interferenceSet.has(lw)) colorClass = "bg-yellow-600 text-white";
                                            return (
                                                <span
                                                    key={idx}
                                                    className={`px-2 py-1 rounded text-sm ${colorClass}`}
                                                >
                                                    {w.word}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    {audioURLs[cycle.index] ? (
                                        <CycleAudio src={audioURLs[cycle.index]} />
                                    ) : (
                                        <span className="text-gray-500 text-xs">No audio</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <textarea
            className="w-full h-64 bg-gray-800 text-gray-300 p-3 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            value={rawJSON}
            readOnly
        />
    );
});

export default RAVLTResultsViewer;
