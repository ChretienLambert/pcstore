const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  product: { type: mongoose.Schema.ObjectId, ref: "Product", required: false },
  isCustomBuild: { type: Boolean, default: false },
  components: { type: Array, default: [] },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: false },
    checkout: {
      type: mongoose.Schema.ObjectId,
      ref: "Checkout",
      required: false,
    }, // <-- link to checkout
    orderItems: [orderItemSchema],
    shippingAddress: { type: Object, default: {} },
    paymentMethod: { type: String, default: "cod" },
    itemsPrice: Number,
    shippingPrice: Number,
    taxPrice: Number,
    totalPrice: Number,
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    }, // <-- status
    ownerName: { type: String }, // readable owner for admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
