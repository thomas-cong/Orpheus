import { defineConfig } from "vite";
import { mergeConfig } from "vite";
import baseConfig from "../vite.config";

// Extend the base configuration with mirror-specific settings
export default mergeConfig(
    baseConfig,
    defineConfig({
        // Override the dev server port to avoid conflicts with the main app
        server: {
            port: 5174,
        },
        // Add any mirror-specific configurations here
    })
);
