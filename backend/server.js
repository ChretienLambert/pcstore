// Instrument path-to-regexp to capture malformed patterns at runtime (helps Vercel debugging)
try {
  const ptr = require('path-to-regexp');
  // wrap parse to log inputs that cause errors (note: internal module uses local parse/name, so this may not catch internal throws)
  if (ptr && typeof ptr.parse === 'function') {
    const origParse = ptr.parse;
    ptr.parse = function (str) {
      try {
        return origParse.apply(this, arguments);
      } catch (err) {
        try { console.error('path-to-regexp parse error. input:', String(str)); } catch(e){}
        throw err;
      }
    };
  }
  // wrap name to show token name errors (best-effort)
  if (ptr && typeof ptr.name === 'function') {
    const origName = ptr.name;
    ptr.name = function () {
      try {
        return origName.apply(this, arguments);
      } catch (err) {
        try { console.error('path-to-regexp name parse error. arguments:', arguments); } catch(e){}
        throw err;
      }
    };
  }
  // wrap exported pathToRegexp/match/compile to catch and log the path argument when internal parse throws
  if (ptr && typeof ptr.pathToRegexp === 'function') {
    const origPathToRegexp = ptr.pathToRegexp;
    ptr.pathToRegexp = function (p, options) {
      try {
        return origPathToRegexp.apply(this, arguments);
      } catch (err) {
        try { console.error('path-to-regexp pathToRegexp error. path arg:', p, 'type:', typeof p); } catch(e){}
        throw err;
      }
    };
  }
  if (ptr && typeof ptr.match === 'function') {
    const origMatch = ptr.match;
    ptr.match = function (p, options) {
      try {
        return origMatch.apply(this, arguments);
      } catch (err) {
        try { console.error('path-to-regexp match error. path arg:', p, 'type:', typeof p); } catch(e){}
        throw err;
      }
    };
  }
  if (ptr && typeof ptr.compile === 'function') {
    const origCompile = ptr.compile;
    ptr.compile = function (p, options) {
      try {
        return origCompile.apply(this, arguments);
      } catch (err) {
        try { console.error('path-to-regexp compile error. path arg:', p, 'type:', typeof p); } catch(e){}
        throw err;
      }
    };
  }
} catch (e) {
  // best-effort; not fatal if path-to-regexp isn't present at this time
  // console.warn('Failed to instrument path-to-regexp:', e && e.message);
}

// Ensure `app` is declared in module scope so later code can safely reference it
let app;

try {
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

// Early init-guard: if a route registration error occurs, set global.__initError
// and respond with a friendly 500 for normal requests while still allowing
// the `/__dump_router` debug endpoint to be used (header-gated below).
app.use((req, res, next) => {
  if (global.__initError) {
    if (req.path === '/__dump_router' || process.env.VERBOSE_ROUTER) return next();
    return res.status(500).json({ ok: false, message: 'server initialization failed' });
  }
  next();
});

// Register routes in a try/catch to prevent initialization-time throws from
// crashing the function — capture any error in `global.__initError` for diagnostics.
try {
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
} catch (err) {
  console.error('Error during route registration:', err && (err.stack || err.message));
  global.__initError = err;
}

// Diagnostic: dump router stack to logs at startup (helps identify malformed layer paths)
try {
  const dumpStack = (note) => {
    try {
      console.error('--- ROUTER STACK DUMP START ---', note || '');
      const stack = app && app._router && app._router.stack;
      if (!stack) {
        console.error('No router stack available');
        return;
      }
      stack.forEach((layer, idx) => {
        try {
          const info = {
            idx,
            name: layer && layer.name,
            routePath: layer.route && layer.route.path,
            routeStack: layer.route && (layer.route.stack || []).map(s => ({ name: s.handle && s.handle.name, method: s.method })),
            regexp: layer && layer.regexp && layer.regexp.toString && layer.regexp.toString(),
            keys: layer && layer.keys,
            handleName: layer && layer.handle && layer.handle.name,
          };
          console.error(JSON.stringify(info));
        } catch (e) {
          console.error('Error dumping layer', idx, e && e.message);
        }
      });
      console.error('--- ROUTER STACK DUMP END ---');
    } catch (e) {
      console.error('Failed to dump router stack', e && e.message);
    }
  };
  // Only dump for production or when VERBOSE_ROUTER is set
  if (process.env.NODE_ENV === 'production' || process.env.VERBOSE_ROUTER) {
    dumpStack('startup');
  }
  // attach for later debugging in uncaughtException handler
  global.__dumpRouterStack = dumpStack;
} catch (e) {
  // swallow
}

// Simple root route to confirm deployment (useful for backend project domains)
// If initialization completed successfully, return a simple success string so the
// frontend can quickly check overall service health.
app.get("/", (req, res) => {
  if (global.__initError) {
    // If there was an initialization error, return 500 with diagnostic info
    return res.status(500).json({ ok: false, message: 'Backend initialization error', error: String(global.__initError && (global.__initError.stack || global.__initError.message || global.__initError)) });
  }
  // Healthy: return plain text for simple detection
  res.type('text/plain').send('Backend Working perfectly');
});

// Serve frontend in production and fallback to index.html for SPA routing
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  // Use a regex-based fallback instead of the string '*' which can cause
  // path-to-regexp v8 to attempt to parse an unnamed wildcard token and throw.
  app.get(/.*/, (req, res) => {
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
} catch (err) {
  console.error('Top-level initialization error:', err && (err.stack || err.message));
  // create a minimal fallback app so the function responds with diagnostics instead of crashing
  const express = require('express');
  const fallback = express();
  fallback.get('/__dump_router', (req, res) => {
    return res.status(500).json({ ok: false, error: String(err && (err.stack || err.message)) });
  });
  fallback.use((req, res) => res.status(500).json({ ok: false, message: 'server module initialization failed', error: String(err && (err.stack || err.message)) }));
  module.exports = fallback;
  // stop further execution of this module
  return;
}

// Global error handlers to capture uncaught exceptions and promise rejections and dump router stack for debugging
process.on('uncaughtException', (err) => {
  try {
    console.error('UNCAUGHT EXCEPTION:', err && (err.stack || err.message || err));
    if (typeof global.__dumpRouterStack === 'function') {
      try { global.__dumpRouterStack('uncaughtException'); } catch (e) { console.error('dump stack failed', e && e.message); }
    }
  } catch (e) {
    console.error('Error while handling uncaughtException', e && e.message);
  }
  // rethrow to allow process to exit with non-zero code in serverless
  throw err;
});
process.on('unhandledRejection', (reason, p) => {
  try {
    console.error('UNHANDLED REJECTION at:', p, 'reason:', reason && (reason.stack || reason));
    if (typeof global.__dumpRouterStack === 'function') {
      try { global.__dumpRouterStack('unhandledRejection'); } catch (e) { console.error('dump stack failed', e && e.message); }
    }
  } catch (e) {
    console.error('Error while handling unhandledRejection', e && e.message);
  }
});

// Temporary debug endpoint: return a simplified dump of the Express router stack when
// the request carries the Vercel protection bypass header (preview-protected deployments)
// or when VERBOSE_ROUTER is set in env. This avoids needing Vercel CLI log access.
if (typeof app !== 'undefined' && app && typeof app.get === 'function') {
  app.get('/__dump_router', (req, res) => {
    const bypassHeader = req.get('x-vercel-protection-bypass');
    if (!bypassHeader && !process.env.VERBOSE_ROUTER) {
      return res.status(403).json({ ok: false, message: 'forbidden' });
    }
    try {
      const stack = (app && app._router && app._router.stack) || [];
      const simplified = stack.map((layer, idx) => {
        try {
          return {
            idx,
            name: layer && layer.name,
            mount: layer && layer.regexp && layer.regexp.toString && layer.regexp.toString(),
            routePath: layer && layer.route && layer.route.path,
            routeMethods: layer && layer.route && layer.route.methods,
            keys: layer && layer.keys,
          };
        } catch (e) {
          return { idx, error: e && e.message };
        }
      });
      return res.json({ ok: true, stack: simplified });
    } catch (err) {
      return res.status(500).json({ ok: false, error: String(err && err.message) });
    }
  });
} else {
  // If `app` is missing at this point (module init failed earlier), export a minimal
  // fallback app that exposes `/__dump_router` to return the initialization error.
  try {
    const express = require('express');
    const fallback = express();
    fallback.get('/__dump_router', (req, res) => res.status(500).json({ ok: false, message: 'app not initialized', initError: String(global.__initError && (global.__initError.stack || global.__initError.message || global.__initError)) }));
    module.exports = fallback;
    // stop further module evaluation
    return;
  } catch (e) {
    // If we can't construct even the fallback, let the module continue and fail loudly
    // so Vercel logs provide the stack trace.
  }
}

module.exports = app;
