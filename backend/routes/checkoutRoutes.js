const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

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

  // ensure items have required fields and numeric values
  for (const it of checkoutItems) {
    if (
      !it.productId ||
      !it.name ||
      typeof it.price === "undefined" ||
      typeof it.quantity === "undefined"
    ) {
      return res.status(400).json({ message: "Invalid checkout item" });
    }
    it.price = Number(it.price);
    it.quantity = Number(it.quantity);
    if (
      Number.isNaN(it.price) ||
      Number.isNaN(it.quantity) ||
      it.quantity <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Invalid item quantity or price" });
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

//@route PUT /api/checkout/:id/pay
//@desc Update checkout to mark as paid after successful payment
//@access Private
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    // ensure the acting user owns the checkout or is admin
    if (String(checkout.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to pay this checkout" });
    }

    checkout.paymentStatus = paymentStatus || "paid";
    checkout.paymentDetails = paymentDetails || {};
    checkout.paidAt = new Date();
    await checkout.save();

    return res.json(checkout);
  } catch (error) {
    console.error("PUT pay error:", error);
    return res.status(500).json({ message: "Server error" });
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
