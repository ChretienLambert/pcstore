const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Checkout = require("../models/Checkout");
const { protect, admin } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");

// replace the fallback host that was failing DNS with a reliable placeholder
const DEFAULT_IMAGE =
  process.env.DEFAULT_PRODUCT_IMAGE ||
  "https://placehold.co/400x300?text=No+Image";

const isValidObjectId = (id) =>
  !!id && mongoose.Types.ObjectId.isValid(String(id));

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

// POST create order
router.post("/", protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      idempotencyKey,
    } = req.body;

    // Defensive normalization: ensure orderItems is array and every item has required fields
    const items = Array.isArray(orderItems) ? orderItems : [];
    const normalized = items
      .map((it) => {
        if (!it) return null;
        const n = { ...it };
        // ensure image exists (backend fallback)
        n.image = n.image || DEFAULT_IMAGE;
        n.name =
          n.name || (n.productId ? String(n.productId) : "Unknown Product");
        n.quantity = Number(n.quantity || 1);
        n.price = Number(n.price || 0);
        // ensure we only set product if it's a valid ObjectId
        if (n.product && !isValidObjectId(n.product)) delete n.product;
        if (n.productId && !isValidObjectId(n.productId)) delete n.productId;
        return n;
      })
      .filter(Boolean);

    // helpful debug log of final payload (remove or lower log level in production)
    console.log("Create order payload:", {
      user: req.user ? req.user._id : null,
      itemsCount: normalized.length,
      idempotencyKey,
      itemsPreview: normalized.slice(0, 5).map((i) => ({
        name: i.name,
        image: i.image,
        qty: i.quantity,
        price: i.price,
      })),
    });

    if (!normalized.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = new Order({
      user: req.user._id,
      orderItems: normalized,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      idempotencyKey,
    });

    const createdOrder = await order.save();

    // Clear server-side cart records for this user (best-effort)
    try {
      await Cart.deleteMany({ user: req.user._id }).catch(() => {});
    } catch (e) {
      console.error("Failed to clear user cart after order:", e);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// GET single order (populated)
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email role")
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    // determine order owner id (order.user may be null)
    const orderUserId = order.user
      ? String(order.user._id || order.user)
      : null;
    const requesterId = req.user ? String(req.user._id) : null;

    // only owner or admin can view order
    if (orderUserId !== requesterId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin: update order status (confirm payment for COD etc.)
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status || order.status;

    // if admin marks as 'paid' confirm payment fields
    if (status === "paid") {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    await order.save();
    return res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
