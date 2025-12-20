const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Checkout = require("../models/Checkout");
const Order = require("../models/Order");
const User = require("../models/user");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");
const { protect } = require("../middleware/authMiddleware");

// friendly fallback image
const DEFAULT_IMAGE =
  process.env.DEFAULT_PRODUCT_IMAGE ||
  "https://placehold.co/400x300?text=No+Image";

const isValidObjectId = (id) =>
  !!id && mongoose.Types.ObjectId.isValid(String(id));

//@route POST /api/checkout
//@desc Create a new checkout session
//@access Private
router.post("/", protect, async (req, res) => {
  // normalize/validate incoming payload
  let { checkoutItems, shippingAddress = {}, paymentMethod } = req.body;
  const totalPrice = Number(
    req.body.totalPrice ?? shippingAddress.totalPrice ?? 0
  );

  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  if (
    !checkoutItems ||
    !Array.isArray(checkoutItems) ||
    checkoutItems.length === 0
  ) {
    return res.status(400).json({ message: "No items in checkout" });
  }

  // Defensive normalization: ensure each item has required fields and remove invalid product ids
  checkoutItems = checkoutItems.map((it) => {
    const item = { ...(it || {}) };
    // Cast numeric fields
    item.price = Number(item.price || 0);
    item.quantity = Number(item.quantity || 1);
    // image required by schema - provide fallback
    item.image = item.image || DEFAULT_IMAGE;
    // Only keep productId if it's a valid ObjectId
    if (item.productId && !isValidObjectId(item.productId)) {
      delete item.productId;
    }
    // allow custom builds that omit productId
    return item;
  });

  // validate items after normalization
  for (const it of checkoutItems) {
    if (
      !it.name ||
      typeof it.price === "undefined" ||
      typeof it.quantity === "undefined"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid checkout item", item: it });
    }
    if (
      Number.isNaN(it.price) ||
      Number.isNaN(it.quantity) ||
      it.quantity <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Invalid price/quantity", item: it });
    }
  }

  // validate shippingAddress
  const missing = [];
  if (!shippingAddress.address) missing.push("shippingAddress.address");
  if (!shippingAddress.city) missing.push("shippingAddress.city");
  if (!shippingAddress.postalCode) missing.push("shippingAddress.postalCode");
  if (!shippingAddress.country) missing.push("shippingAddress.country");
  if (!paymentMethod && !shippingAddress.paymentMethod)
    missing.push("paymentMethod");
  if (!totalPrice || Number.isNaN(totalPrice)) missing.push("totalPrice");

  if (missing.length) {
    return res.status(400).json({ message: "Missing fields", errors: missing });
  }

  // prefer top-level paymentMethod if provided
  paymentMethod = paymentMethod || shippingAddress.paymentMethod;

  try {
    // create checkout record and attach user
    const checkout = new Checkout({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "pending",
    });

    const saved = await checkout.save();

    // optionally clear user's cart if you want
    await Cart.deleteMany({ userId: req.user._id }).catch(() => {});

    return res.status(201).json(saved);
  } catch (error) {
    console.error("Create checkout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// New: mark checkout as paid / create order from checkout
router.put("/:id/pay", async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    // idempotent: if order exists return it
    const existing = await Order.findOne({ checkout: checkout._id });
    if (existing) return res.json(existing);

    // optional user resolution from token
    let user = null;
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).lean();
      } catch (e) {
        user = null;
      }
    }

    // build orderItems with defensive normalization
    const orderItems = (checkout.checkoutItems || []).map((it) => {
      const item = {
        name: it.name,
        quantity: Number(it.quantity || 1),
        price: Number(it.price || 0),
        isCustomBuild: Boolean(it.isCustomBuild),
        components: Array.isArray(it.components) ? it.components : [],
        image: it.image || DEFAULT_IMAGE,
      };
      if (it.productId && isValidObjectId(it.productId)) {
        item.product = it.productId;
      }
      return item;
    });

    if (!orderItems.length)
      return res.status(400).json({ message: "No order items" });

    const order = new Order({
      user: user ? user._id : null,
      checkout: checkout._id,
      orderItems,
      shippingAddress: checkout.shippingAddress || {},
      paymentMethod: checkout.paymentMethod || "cod",
      itemsPrice: checkout.itemsPrice || checkout.totalPrice || 0,
      shippingPrice: checkout.shippingPrice || 0,
      taxPrice: checkout.taxPrice || 0,
      totalPrice: checkout.totalPrice || checkout.itemsPrice || 0,
    });

    order.ownerName = user
      ? user.name || user.email
      : checkout.shippingAddress?.name || "Guest";

    if ((checkout.paymentMethod || "cod") === "card") {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = "paid";
    } else {
      order.paymentStatus = "pending";
    }

    await order.save();

    checkout.order = order._id;
    checkout.isPaid = order.isPaid;
    checkout.paidAt = order.paidAt || null;
    await checkout.save();

    return res.status(201).json(order);
  } catch (err) {
    console.error("Checkout pay error:", err);
    return res
      .status(500)
      .json({ message: "Server error creating order from checkout" });
  }
});

//@route POST /api/checkout/:id/finalize
//@desc Finalize checkout and convert to an order after payment confirmation
//@access Private
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id).lean();
    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    // ensure owner
    if (String(checkout.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to finalize this checkout" });
    }

    if (checkout.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // create order with user reference
    const orderData = {
      user: req.user._id,
      orderItems: checkout.checkoutItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      itemsPrice: checkout.checkoutItems.reduce(
        (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
        0
      ),
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: checkout.totalPrice,
      isPaid: true,
      paidAt: checkout.paidAt || new Date(),
      paymentStatus: checkout.paymentStatus || "paid",
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    // remove checkout record
    await Checkout.findByIdAndDelete(checkout._id).catch(() => {});

    // optionally clear cart records for this user
    await Cart.deleteMany({ userId: req.user._id }).catch(() => {});

    return res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Finalize checkout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
