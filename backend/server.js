// Instrument path-to-regexp to capture malformed patterns at runtime (helps Vercel debugging)
try {
  const ptr = require('path-to-regexp');
  // wrap parse to log inputs that cause errors
  if (ptr && typeof ptr.parse === 'function') {
    const origParse = ptr.parse;
    ptr.parse = function (str) {
      try {
        return origParse.apply(this, arguments);
      } catch (err) {
        console.error('path-to-regexp parse error. input:', String(str));
        throw err;
      }
    };
  }
  // wrap name to show token name errors
  if (ptr && typeof ptr.name === 'function') {
    const origName = ptr.name;
    ptr.name = function () {
      try {
        return origName.apply(this, arguments);
      } catch (err) {
        console.error('path-to-regexp name parse error. arguments:', arguments);
        throw err;
      }
    };
  }
} catch (e) {
  // best-effort; not fatal if path-to-regexp isn't present at this time
  // console.warn('Failed to instrument path-to-regexp:', e && e.message);
}

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

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_BASE_URL
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health & DB readiness
const healthRoutes = require("./routes/health");
const ensureDb = require("./middleware/ensureDb");
app.use("/api", healthRoutes);

// All routes below require database connectivity — mount the ensureDb middleware
app.use("/api", ensureDb);

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

// Simple root route to confirm deployment (useful for backend project domains)
// This returns a small JSON message instead of 404 when invoked at the root.
app.get("/", (req, res) => {
  return res.json({ ok: true, message: "backend root: deployed", timestamp: new Date().toISOString() });
});

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
  // Connect to database and start server
  connectDB()
    .then(() => {
      console.log(`🚀 Server starting on port ${PORT}`);
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to connect to database:', error.message);
      process.exit(1);
    });
}

module.exports = app;
