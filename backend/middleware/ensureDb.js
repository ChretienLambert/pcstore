// backend/middleware/ensureDb.js
const connectDB = require("../config/db");

let _connected = false;

module.exports = async function ensureDb(req, res, next) {
  // If already connected, proceed
  if (_connected) return next();

  try {
    await connectDB();
    _connected = true;
    return next();
  } catch (err) {
    console.error("ensureDb: failed to connect to DB:", err.message);
    // For API requests that require DB, return 503; health endpoint should be mounted before this middleware.
    return res.status(503).json({ message: "Database unavailable" });
  }
};

// Helper for health checks / testing
module.exports.getConnected = () => _connected;