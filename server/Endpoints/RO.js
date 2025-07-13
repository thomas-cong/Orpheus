import express from "express";

const router = express.Router();

// All RO endpoints are now handled by the generic /api/trials endpoints.
// This file is kept for potential future RO-specific endpoints.

import path from "path";
import os from "os";
import fs from "fs";
import { spawn } from "child_process";
import { downloadBlobToFile } from "../blobHelpers.js";

// POST /api/ro/compareAzureImages
router.post("/calculateNaiveSimilarityScore", async (req, res) => {
    const { containerName, blobName1 } = req.body;
    if (!containerName || !blobName1) {
        return res
            .status(400)
            .json({ error: "Missing containerName or blobName1" });
    }
    const connectionString = process.env.IMAGE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        return res
            .status(500)
            .json({ error: "Image storage connection string not configured" });
    }
    const tempDir = os.tmpdir();
    const imgPath = path.join(tempDir, `img_${Date.now()}.png`);
    try {
        await downloadBlobToFile(
            connectionString,
            containerName,
            blobName1,
            imgPath
        );
        const pythonScript = path.join(
            path.resolve("."),
            "server/AnalysisAlgorithms/image_similarity.py"
        );
        const pyProcess = spawn("python3", [pythonScript, imgPath]);
        let output = "";
        let errorOutput = "";
        pyProcess.stdout.on("data", (data) => {
            output += data.toString();
        });
        pyProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });
        pyProcess.on("close", (code) => {
            fs.unlink(imgPath, () => {});
            if (code === 0) {
                res.json({ similarity: parseFloat(output) });
            } else {
                res.status(500).json({
                    error: errorOutput || "Python script failed",
                });
            }
        });
    } catch (err) {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/ro/listBinImages
 * Query params: containerName
 * Returns: { images: [blobName, ...] }
 */
router.get("/listBinImages", async (req, res) => {
    const { containerName } = req.query;
    if (!containerName) {
        return res.status(400).json({ error: "Missing containerName" });
    }
    const connectionString = process.env.IMAGE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        return res
            .status(500)
            .json({ error: "Image storage connection string not configured" });
    }
    try {
        const { listBlobsInContainer } = await import("../blobHelpers.js");
        const images = await listBlobsInContainer(
            connectionString,
            containerName
        );
        res.json({ images });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
