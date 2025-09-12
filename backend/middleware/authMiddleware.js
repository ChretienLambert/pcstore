const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

/**
 * Extract token safely from Authorization header or cookie.
 * Accepts "Bearer <token>" or raw token.
 */
const getTokenFromReq = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === "string") {
    if (authHeader.startsWith("Bearer ")) return authHeader.split(" ")[1];
    return authHeader;
  }
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
};

const protect = async (req, res, next) => {
  try {
    // removed raw token console.log to avoid leaking tokens in logs

    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }

    // support payload shapes: { id } or { user: { id } } or { _id }
    const userId =
      decoded.id || decoded._id || (decoded.user && (decoded.user.id || decoded.user._id));

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("protect middleware error:", err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

const admin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin required" });
  next();
};

// Ensure routes can import: const { protect, admin } = require("../middleware/authMiddleware");
module.exports = { protect, admin };
