const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "", // Make it optional with default value
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkoutItems: {
      type: [checkoutItemSchema],
      required: true,
      validate: [(v) => v.length > 0, "checkoutItems cannot be empty"],
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    // payment / status fields at top-level
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    paymentDetails: { type: mongoose.Schema.Types.Mixed },
    // finalization fields
    isFinalized: { type: Boolean, default: false },
    finalizedAt: { type: Date },
    // PC build reference
    pcBuildId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PcBuild",
    },
    isPcBuildCheckout: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// In models/Checkout.js, add this pre-save hook
checkoutSchema.pre("save", function (next) {
  // Validate that checkoutItems total matches totalPrice
  if (this.isModified("checkoutItems") || this.isModified("totalPrice")) {
    const calculatedTotal = this.checkoutItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Allow small rounding differences
    if (Math.abs(calculatedTotal - this.totalPrice) > 0.01) {
      return next(
        new Error(
          `Checkout total ${this.totalPrice} does not match items total ${calculatedTotal}`
        )
      );
    }
  }
  next();
});

module.exports = mongoose.model("Checkout", checkoutSchema);
