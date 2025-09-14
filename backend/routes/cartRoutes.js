const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper: safely check ObjectId
const isValidId = (id) => !!id && mongoose.Types.ObjectId.isValid(String(id));

// normalize possible object inputs to id string
const normalizeIncomingId = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe === "object") return maybe._id || maybe.id || null;
  return String(maybe);
};

// Helper function to get a cart by user ID or guest ID
const getCart = async (userId, guestId) => {
  if (userId && isValidId(userId)) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

//@route POST /api/cart
//@desc Add a product to the cart for a guest or logged-in user
//@access Public
router.post("/", async (req, res) => {
  try {
    let { productId, quantity = 1, size, color, guestId, userId } = req.body;
    productId = normalizeIncomingId(productId);
    if (!productId) return res.status(400).json({ message: "Missing productId" });
    if (!isValidId(productId)) return res.status(400).json({ message: "Invalid productId" });

    quantity = Number(quantity) || 1;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const pidStr = String(productId);
    let cart = await getCart(userId, guestId);

    const image =
      Array.isArray(product.images) ? product.images[0]?.url || "" : product.images || "";

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          String(p.productId) === pidStr &&
          (p.size || "") === (size || "") &&
          (p.color || "") === (color || "")
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image,
          price: Number(product.price) || 0,
          size,
          color,
          quantity,
        });
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      const newCart = await Cart.create({
        user: isValidId(userId) ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image,
            price: Number(product.price) || 0,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: (Number(product.price) || 0) * quantity,
      });
      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//@route PUT /api/cart
//@desc Update product in the cart for a guest or logged-in user
//@access Public
router.put("/", async (req, res) => {
  try {
    let { productId, quantity, size, color, guestId, userId } = req.body;
    productId = normalizeIncomingId(productId);
    if (!productId) return res.status(400).json({ message: "Missing productId" });
    quantity = Number(quantity);

    let cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const pidStr = String(productId);
    const productIndex = cart.products.findIndex(
      (p) =>
        String(p.productId) === pidStr &&
        (p.size || "") === (size || "") &&
        (p.color || "") === (color || "")
    );

    if (productIndex > -1) {
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1);
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//@route DELETE /api/cart
//@desc Remove a product from the cart
//@access Public
router.delete("/", async (req, res) => {
  try {
    let { productId, size, color, guestId, userId } = req.body;
    productId = normalizeIncomingId(productId);
    if (!productId) return res.status(400).json({ message: "Missing productId" });

    let cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const pidStr = String(productId);
    const productIndex = cart.products.findIndex(
      (p) =>
        String(p.productId) === pidStr &&
        (p.size || "") === (size || "") &&
        (p.color || "") === (color || "")
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//@route GET  /api/cart
//@desc Get logged-in user's or guest user's cart
//@access Public
router.get("/", async (req, res) => {
  try {
    const { userId, guestId } = req.query;
    const query = {};
    if (userId) query.user = userId;
    else if (guestId) query.guestId = guestId;

    const cart = await Cart.findOne(query).populate("products.product");
    if (!cart) {
      // return consistent empty cart (200) so frontend can always expect { products: [] }
      return res.status(200).json({ products: [] });
    }
    return res.status(200).json(cart);
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

//@route POST /api/cart/merge
//@desc Merge guest cart into user cart on login
//@access Private
router.post("/merge", protect, async (req, res) => {
  try {
    const { guestId } = req.body;
    if (!guestId) return res.status(400).json({ message: "Missing guestId" });

    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    if (!guestCart) {
      return res.status(404).json({ message: "Guest cart not found" });
    }

    // If guest cart empty: delete and return user's cart or empty response
    if (!guestCart.products || guestCart.products.length === 0) {
      await Cart.deleteOne({ _id: guestCart._id }).catch(() => {});
      if (userCart) return res.status(200).json(userCart);
      return res.status(200).json({ message: "Guest cart empty, nothing to merge" });
    }

    if (userCart) {
      // Merge guest items into user cart
      guestCart.products.forEach((guestItem) => {
        const gPid = String(guestItem.productId);
        const idx = userCart.products.findIndex(
          (p) =>
            String(p.productId) === gPid &&
            (p.size || "") === (guestItem.size || "") &&
            (p.color || "") === (guestItem.color || "")
        );

        if (idx > -1) {
          userCart.products[idx].quantity += Number(guestItem.quantity || 0);
        } else {
          userCart.products.push({
            productId: guestItem.productId,
            name: guestItem.name,
            image: guestItem.image,
            price: Number(guestItem.price) || 0,
            size: guestItem.size,
            color: guestItem.color,
            quantity: Number(guestItem.quantity) || 0,
          });
        }
      });

      userCart.totalPrice = userCart.products.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      await userCart.save();
      // Remove guest cart after merging
      await Cart.deleteOne({ _id: guestCart._id }).catch((err) => {
        console.error("Failed to delete guest cart after merge:", err);
      });
      return res.status(200).json(userCart);
    } else {
      // Assign guest cart to user
      guestCart.user = req.user._id;
      guestCart.guestId = undefined;
      guestCart.totalPrice = guestCart.products.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      await guestCart.save();
      return res.status(200).json(guestCart);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
