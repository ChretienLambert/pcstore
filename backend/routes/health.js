// backend/routes/health.js
const express = require("express");
const router = express.Router();
const connectDB = require("../config/db");
const { getConnected } = require("../middleware/ensureDb");

// Basic health endpoint. Does a quick DB connect attempt and reports status.
router.get("/_health", async (req, res) => {
  try {
    await connectDB();
    return res.json({ ok: true, db: "ok" });
  } catch (err) {
    // If DB connect fails, still respond with 503 to indicate degraded service.
    return res.status(503).json({ ok: false, db: "down", error: err.message });
  }
});

// Lightweight public ping endpoint — small JSON response confirming the backend is deployed.
// Note: project-level Vercel Authentication may still block access if enabled.
router.get("/ping", (req, res) => {
  return res.json({ ok: true, message: "backend reachable", timestamp: new Date().toISOString() });
});

module.exports = router;