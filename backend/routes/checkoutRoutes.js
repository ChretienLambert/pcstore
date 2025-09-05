const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//@route POST /api/checkout
//@desc Create a new checkout session (supports both regular products and PC builds)
//@access Private
router.post("/", protect, async (req, res) => {
  // normalize/validate incoming payload
  let {
    checkoutItems,
    shippingAddress = {},
    paymentMethod,
    pcBuildId,
  } = req.body;
  let totalPrice = Number(
    req.body.totalPrice ?? shippingAddress.totalPrice ?? 0
  );

  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  // Handle PC build checkout
  if (pcBuildId) {
    try {
      const PcBuild = require("../models/PcBuild");
      const pcBuild = await PcBuild.findById(pcBuildId).populate(
        "components.productId"
      );

      if (!pcBuild) {
        return res.status(404).json({ message: "PC Build not found" });
      }

      // Check if user owns the build or it's public
      if (
        pcBuild.user.toString() !== req.user._id.toString() &&
        !pcBuild.isPublic
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to checkout this build" });
      }

      // Convert PC build components to checkout items
      // Convert PC build components to checkout items
      checkoutItems = pcBuild.components.map((component) => {
        // Ensure we have a valid image URL
        let imageUrl = "";
        if (
          component.productId.images &&
          component.productId.images.length > 0
        ) {
          imageUrl = component.productId.images[0].url || "";
        }

        // Provide a default image if none exists
        if (!imageUrl) {
          imageUrl = "https://via.placeholder.com/150?text=No+Image";
        }

        return {
          productId: component.productId._id,
          name: component.productId.name,
          image: imageUrl, // Always provide an image
          price: component.productId.price,
          quantity: component.quantity,
          size: component.size || "",
          color: component.color || "",
        };
      });

      // Calculate total price from PC build
      const calculatedTotal = checkoutItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);

      // Always use the calculated total for PC builds, ignore any provided totalPrice
      totalPrice = calculatedTotal;
    } catch (error) {
      console.error("Error processing PC build checkout:", error);
      return res.status(500).json({ message: "Error processing PC build" });
    }
  }

  // Validate checkout items
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
      return res.status(400).json({
        message:
          "checkoutItems must include productId, name, price and quantity",
      });
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
        .json({ message: "Invalid price or quantity in checkoutItems" });
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

  // Remove totalPrice from missing validation since it's calculated for PC builds
  // Only validate totalPrice if it's not a PC build checkout
  if (!pcBuildId && (!totalPrice || Number.isNaN(totalPrice))) {
    missing.push("totalPrice");
  }

  if (missing.length) {
    return res
      .status(400)
      .json({ message: "Missing required fields", missing });
  }

  // prefer top-level paymentMethod if provided
  paymentMethod = paymentMethod || shippingAddress.paymentMethod;

  try {
    const checkoutData = {
      user: req.user._id,
      checkoutItems,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      paymentMethod,
      totalPrice: Number(totalPrice),
      paymentStatus: "pending",
      isPaid: false,
      paymentDetails: null,
      isFinalized: false,
    };

    // Add PC build reference if applicable
    if (pcBuildId) {
      checkoutData.pcBuildId = pcBuildId;
      checkoutData.isPcBuildCheckout = true;
    }

    const newCheckout = await Checkout.create(checkoutData);

    console.log(`Checkout created for user:${req.user._id}`);
    return res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ message: "Server Error" });
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

    if (paymentStatus === "paid") {
      // Validate payment amount matches checkout total
      if (paymentDetails && paymentDetails.amount) {
        const paymentAmount = Number(paymentDetails.amount);
        const checkoutTotal = Number(checkout.totalPrice);

        // Allow small rounding differences but validate significant amounts
        if (Math.abs(paymentAmount - checkoutTotal) > 0.01) {
          return res.status(400).json({
            message: "Payment amount does not match checkout total",
            checkoutTotal: checkoutTotal,
            paymentAmount: paymentAmount,
            difference: (paymentAmount - checkoutTotal).toFixed(2),
          });
        }
      }

      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();
      return res.status(200).json(checkout);
    } else {
      return res.status(400).json({ message: "Invalid Payment Status" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//@route POST /api/checkout/:id/finalize
//@desc Finalize checkout and convert to an order after payment confirmation
//@access Private
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    if (checkout.isPaid && !checkout.isFinalized) {
      const orderData = {
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      };

      // Add PC build reference if this was a PC build checkout
      if (checkout.pcBuildId) {
        orderData.pcBuildId = checkout.pcBuildId;
        orderData.isPcBuildOrder = true;
      }

      const finalOrder = await Order.create(orderData);

      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();

      // Clear user's cart after successful order
      await Cart.findOneAndDelete({ user: checkout.user });

      return res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      return res.status(400).json({ message: "Checkout already finalized" });
    } else {
      return res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//@route GET /api/checkout/pc-build/:buildId
//@desc Get checkout details for a specific PC build
//@access Private
router.get("/pc-build/:buildId", protect, async (req, res) => {
  try {
    const PcBuild = require("../models/PcBuild");
    const build = await PcBuild.findById(req.params.buildId).populate(
      "components.productId",
      "name price images countInStock"
    );

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // Check authorization
    if (build.user.toString() !== req.user._id.toString() && !build.isPublic) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check stock availability
    const outOfStockItems = [];
    build.components.forEach((component) => {
      if (component.productId.countInStock < component.quantity) {
        outOfStockItems.push({
          productId: component.productId._id,
          name: component.productId.name,
          required: component.quantity,
          available: component.productId.countInStock,
        });
      }
    });

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        message: "Some components are out of stock",
        outOfStockItems,
      });
    }

    // Calculate total price
    const totalPrice = build.components.reduce((total, component) => {
      return total + component.productId.price * component.quantity;
    }, 0);

    // Prepare checkout items
    const checkoutItems = build.components.map((component) => {
      let imageUrl = "https://via.placeholder.com/150?text=No+Image";
      if (
        component.productId.images &&
        component.productId.images.length > 0 &&
        component.productId.images[0].url
      ) {
        imageUrl = component.productId.images[0].url;
      }

      return {
        productId: component.productId._id,
        name: component.productId.name,
        image: imageUrl,
        price: component.productId.price,
        quantity: component.quantity,
        size: component.size || "",
        color: component.color || "",
      };
    });

    res.json({
      build: {
        _id: build._id,
        name: build.name,
        description: build.description,
      },
      checkoutItems,
      totalPrice,
      estimatedWattage: build.estimatedWattage,
      compatibilityStatus: build.compatibilityStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
