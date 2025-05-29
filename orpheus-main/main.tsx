import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../global-files/index.css";
import TestingStart from "./TestingStart.tsx";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import LandingPage from "./LandingPage.tsx";
// Create router configuration
const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/testing" element={<TestingStart />} />
        </>
    )
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <>
            <RouterProvider router={router} />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </>
    </StrictMode>
);
