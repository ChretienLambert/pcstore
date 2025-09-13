const express = require("express");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

// POST /api/subscribe
//@desc Create or acknowledge a newsletter subscription
//@access Public
router.post("/", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalized = email.trim().toLowerCase();
    // simple regex check
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalized)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    // prevent duplicates
    let sub = await Subscriber.findOne({ email: normalized });
    if (sub) {
      return res.status(200).json({ message: "You are already subscribed" });
    }
    sub = new Subscriber({ email: normalized });
    await sub.save();
    return res.status(201).json({ message: "Thanks — you are subscribed" });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
