import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../global-files/index.css";
import App from "./App.tsx";
import PatientPortal from "./PatientPortal.tsx";
import Testing from "./Testing.tsx";
import React from "react";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";

// Create router configuration
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route path="portal" element={<PatientPortal />} />
            <Route path="testing" element={<Testing />} />
        </Route>
    )
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
