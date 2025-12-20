const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscribeRoutes = require("./routes/subscribeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");

dotenv.config();
// Defer connecting to the database until a request is received so imports don't throw
// in serverless environments (Vercel) when env vars might not be set at import time.
// We'll ensure a DB connection for API routes using a lightweight middleware below.

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight middleware to ensure DB connection for API requests.
// It attempts to connect on the first request and will reuse the connection thereafter.
const ensureDb = async (req, res, next) => {
  // Only run for API routes; static or root routes don't need DB.
  if (!req.path.startsWith('/api/')) return next();
  try {
    await connectDB();
    return next();
  } catch (err) {
    console.error('Database connection error:', err && (err.message || err));
    // For a simple health probe, let '/api/_health' return a helpful response
    if (req.path === '/api/_health') {
      return res.status(200).json({ status: 'ok', db: 'unavailable' });
    }
    return res.status(500).json({ message: 'Database connection failed' });
  }
};
app.use(ensureDb);

// Quick health-check route
app.get('/api/_health', (req, res) => {
  return res.json({ status: 'ok' });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subscribeRoutes);

// Admin
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// Serve frontend in production and fallback to index.html for SPA routing
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    // if request is not an API call, serve index.html so client-side routing works
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API route not found" });
    }
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
// Only start the server when this file is run directly (e.g. `node server.js`).
// In serverless environments (Vercel), the module is imported and should NOT call `listen()`.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
