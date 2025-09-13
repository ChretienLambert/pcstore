const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

//@route GET api/order/my-orders
//@desc Get logged-in user's orders
//@access Private
router.get("/my-orders", protect, async (req, res) => {
  try {
    //Find the orders for the autenticated user
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    }); //sort by most recent orders
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/orders/:id - user or admin can view
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    // allow if owner or admin
    const userId = String(req.user._id);
    if (String(order.user) !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    return res.json(order);
  } catch (err) {
    console.error("GET /api/orders/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

//@route POST /api/orders
//@desc Create new order
//@access Private
router.post("/", protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }
    // compute totals defensively
    const itemsPrice = orderItems.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
      0
    );
    const taxPrice = Number(req.body.taxPrice || 0);
    const shippingPrice = Number(req.body.shippingPrice || 0);
    const totalPrice = Number(
      req.body.totalPrice ?? itemsPrice + taxPrice + shippingPrice
    );

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentStatus: "pending",
    });

    const created = await order.save();
    return res.status(201).json(created);
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
