// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Checkout = require("../models/Checkout");
const { protect, admin } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
// --- added Product model to validate & update stock counts ---
const Product = require("../models/Product");

// fallback image if we can't determine a usable image URL
const DEFAULT_IMAGE =
  process.env.DEFAULT_PRODUCT_IMAGE ||
  "https://placehold.co/400x300?text=No+Image";

// Optional: FRONTEND_BASE_URL can be set in env if you host images under your frontend domain
// e.g. FRONTEND_BASE_URL=https://example.com
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || "";

// isValidObjectId helper
const isValidObjectId = (id) =>
  !!id && mongoose.Types.ObjectId.isValid(String(id));

/**
 * Normalize image payload into a string URL for order records.
 * Accepts:
 *  - string absolute URL ("https://...")
 *  - string relative path ("/static/...", "src/assets/...") -> optional FRONTEND_BASE prefix
 *  - object with properties { url, src, path, secure_url, publicUrl }
 *  - otherwise returns DEFAULT_IMAGE
 */
function normalizeImageToString(image, req = null) {
  if (!image) return DEFAULT_IMAGE;

  // If already a string
  if (typeof image === "string") {
    const s = image.trim();
    if (!s) return DEFAULT_IMAGE;
    // absolute URL -> use as-is
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    // relative path starting with // (protocol-relative) -> prefix https:
    if (s.startsWith("//")) return `https:${s}`;
    // path-like string e.g. "/uploads/..." or "src/assets/..." -> try FRONTEND_BASE or host if available
    if (s.startsWith("/")) {
      if (FRONTEND_BASE) return `${FRONTEND_BASE}${s}`;
      return s;
    }
    // other non-http strings (like "data:image/..." ) -> accept common data URIs
    if (s.startsWith("data:")) return s;
    // unknown string pattern -> fallback to DEFAULT_IMAGE
    return DEFAULT_IMAGE;
  }

  // If it's an object, try common fields
  if (typeof image === "object") {
    const tryFields = ["url", "src", "path", "secure_url", "publicUrl", "filename"];
    for (const f of tryFields) {
      const v = image[f];
      if (v && typeof v === "string") {
        if (v.startsWith("http")) return v;
        if (v.startsWith("/")) return FRONTEND_BASE ? `${FRONTEND_BASE}${v}` : v;
        return v;
      }
    }
    // lastly, if there's nested object like image.url.value etc, attempt JSON-stringify fallback -> no, prefer DEFAULT_IMAGE
    return DEFAULT_IMAGE;
  }

  // anything else fallback
  return DEFAULT_IMAGE;
}

//@route GET api/order/my-orders
//@desc Get logged-in user's orders
//@access Private
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
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
        const item = { ...(it || {}) };
        // normalize keys
        item.quantity = Number(item.quantity || item.qty || 1);
        item.price = Number(item.price || item.unitPrice || 0);
        item.name = item.name || item.title || "Unnamed product";
        item.image = normalizeImageToString(item.image || (item.images && item.images[0]) || DEFAULT_IMAGE);
        if (item.productId && !isValidObjectId(item.productId)) {
          delete item.productId;
        } else if (item.productId) {
          item.productId = String(item.productId);
        }
        return item;
      })
      .filter(Boolean);

    if (!normalized.length) {
      return res.status(400).json({ message: "No valid order items provided" });
    }

    const parsedItemsPrice = Number(itemsPrice || 0);
    const parsedShippingPrice = Number(shippingPrice || 0);
    const parsedTaxPrice = Number(taxPrice || 0);
    const parsedTotalPrice = Number(totalPrice || parsedItemsPrice + parsedShippingPrice + parsedTaxPrice);

    const decremented = [];

    try {
      for (const it of normalized) {
        if (it.productId) {
          const qty = Number(it.quantity || 1);
          const updated = await Product.findOneAndUpdate(
            { _id: it.productId, countInStock: { $gte: qty } },
            { $inc: { countInStock: -qty } },
            { new: true }
          );

          if (!updated) {
            for (const d of decremented) {
              try {
                await Product.findByIdAndUpdate(d.productId, { $inc: { countInStock: d.qty } });
              } catch (revertErr) {
                console.error("Failed to revert stock for", d.productId, revertErr);
              }
            }
            return res.status(400).json({ message: `Insufficient stock for product: ${it.name}` });
          }

          decremented.push({ productId: it.productId, qty });
        }
      }

      // All inventory reserved, create the order
      const order = new Order({
        user: req.user._id,
        orderItems: normalized.map((it) => ({
          name: it.name,
          image: it.image,
          price: it.price,
          quantity: it.quantity,
          product: it.productId || undefined,
          isCustomBuild: Boolean(it.isCustomBuild),
          components: it.components || [],
        })),
        shippingAddress: shippingAddress || {},
        paymentMethod: paymentMethod || "cod",
        itemsPrice: parsedItemsPrice,
        shippingPrice: parsedShippingPrice,
        taxPrice: parsedTaxPrice,
        totalPrice: parsedTotalPrice,
        status: paymentMethod === "card" ? "paid" : "pending",
        isPaid: paymentMethod === "card" ? true : false,
        paidAt: paymentMethod === "card" ? new Date() : undefined,
      });

      const saved = await order.save();
      await saved.populate("user", "name email role");
      return res.status(201).json(saved);
    } catch (err) {
      for (const d of decremented) {
        try {
          await Product.findByIdAndUpdate(d.productId, { $inc: { countInStock: d.qty } });
        } catch (revertErr) {
          console.error("Failed to revert stock after error for", d.productId, revertErr);
        }
      }
      console.error("Order creation error:", err);
      return res.status(500).json({ message: "Failed to create order" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET single order (populated)
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Admin: update order status (confirm payment for COD etc.)
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (typeof req.body.status !== "undefined") order.status = req.body.status;
    if (typeof req.body.isPaid !== "undefined") order.isPaid = Boolean(req.body.isPaid);
    if (req.body.paidAt) order.paidAt = req.body.paidAt;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
