import React, { useEffect, useState } from "react";
import { get } from "../../global-files/utilities";

const FileList = (props: { containerName: string }) => {
    const [fileList, setFileList] = useState([]);
    useEffect(() => {
        if (!props.containerName) return;
        get("/api/audioStorage/getContainerFileURLs", {
            containerName: props.containerName,
        })
            .then((res) => {
                setFileList(res.urls);
                console.log(res.urls);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [props.containerName]);
    return (
        <div className="w-full p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">File List</h2>
            {fileList && fileList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {fileList.map((file: any) => (
                        <div
                            key={file.blobName}
                            className="p-3 border border-gray-700 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-gray-200"
                        >
                            {file.blobName}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400">No files available</div>
            )}
        </div>
    );
};
export default FileList;
