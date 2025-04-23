import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    root: resolve(__dirname, "."),
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
    },
    plugins: [react(), tailwindcss()],
    server: {
        port: 5174,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
