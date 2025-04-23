import React from "react";
import QueryBar from "./QueryBar/QueryBar";
import "../global-files/index.css";

export default function App() {
    return (
        <div className="flex flex-col items-center min-h-screen">
            <QueryBar />
        </div>
    );
}
