const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

// allowed statuses must match Order model's enum
const ALLOWED_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"];

//@route GET /api/admin/orders
//@desc Get all order (Admin only)
//@access Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// PUT /api/admin/orders/:id  - update order status (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    // handle mongoose validation errors gracefully
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message).join("; ");
      return res.status(400).json({ message: messages });
    }
    console.error("Admin order update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//@route DELETE /api/admin/orders/:id
//@desc Delete an order
//@access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: "Order removed" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
