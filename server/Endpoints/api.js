import express from "express";
import bodyParser from "body-parser";
import testGenerationRoutes from "./testGeneration.js";
import patientRoutes from "./Patients.js";
import audioStorageRoutes from "./AudioStorage.js";
import trialRoutes from "./Trials.js";

const router = express.Router();

// For JSON bodies
router.use(express.json({ limit: '50mb' }));

// For URL-encoded bodies
router.use(express.urlencoded({ limit: '50mb', extended: true }));

router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

/**
 * @route GET /api
 * @description Check if the API is running
 * @access Public
 * @returns {string} - Simple text message indicating the API is running
 */
router.get("/", (req, res) => {
    res.send("API is running");
});

// Mount the various route modules
router.use("/testhelper", testGenerationRoutes);
router.use("/patients", patientRoutes);
router.use("/audioStorage", audioStorageRoutes);
router.use("/trials", trialRoutes);

/**
 * @route ALL *
 * @description Catch-all route for undefined endpoints
 * @access Public
 * @returns {Object} - JSON object with error message
 * @returns {string} msg - Error message indicating route not found
 */
router.all("*", (req, res) => {
    console.log(`API route not found: ${req.method} ${req.url}`);
    res.status(404).send({ msg: "API route not found" });
});

// Export the router directly for Express to use
export default router;
