import React, { useEffect, useState } from "react";
import { get } from "../../global-files/utilities";

const FileList = (props: { containerName: string }) => {
    const [fileList, setFileList] = useState([]);
    useEffect(() => {
        if (!props.containerName) return;
        // Get file URLs from Azure Blob Storage
        get("/api/audioStorage/getContainerFileURLs", {
            containerName: props.containerName,
        })
            .then((res) => {
                // Set file list
                setFileList(res.urls);
                console.log(res.urls);
            })
            .catch((err) => {
                // Handle error
                console.error(err);
            });
    }, [props.containerName]);

    return (
        <div className="w-full p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">
                File List
            </h2>
            {/* Render file list if available */}
            {fileList && fileList.length > 0 ? (
                <div className="space-y-2 w-full">
                    {fileList.map((file: any) => {
                        return (
                            <div
                                key={file.blobName}
                                className="p-3 border border-gray-700 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-black-900 flex flex-col"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="truncate">
                                        {file.blobName}
                                    </span>
                                    <button
                                        className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs"
                                        onClick={() =>
                                            window.open(file.url, "_blank")
                                        }
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-gray-400">No files available</div>
            )}
        </div>
    );
};
export default FileList;
