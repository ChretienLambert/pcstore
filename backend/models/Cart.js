const mongoose = require("mongoose");

const cartComponentSchema = new mongoose.Schema(
  {
    slot: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    name: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    image: String,
    isCustomBuild: { type: Boolean, default: false },
    components: [cartComponentSchema],
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
