const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

// GET /api/admin/orders - list all orders (populated)
router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email role")
      .lean();
    return res.json(orders);
  } catch (err) {
    console.error("GET admin/orders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/orders/:id - update order fields (isDelivered, paymentStatus, isPaid)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (typeof req.body.isDelivered !== "undefined")
      order.isDelivered = Boolean(req.body.isDelivered);
    if (typeof req.body.isPaid !== "undefined")
      order.isPaid = Boolean(req.body.isPaid);
    if (typeof req.body.paymentStatus !== "undefined")
      order.paymentStatus = req.body.paymentStatus;
    if (req.body.paidAt) order.paidAt = req.body.paidAt;

    const updated = await order.save();
    await updated.populate("user", "name email role");
    return res.json(updated);
  } catch (err) {
    console.error("PUT admin/orders/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/orders/:id
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    await order.deleteOne();
    return res.json({ message: "Order removed" });
  } catch (err) {
    console.error("DELETE admin/orders/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
