const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema(
  {
    slot: { type: String },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // optional link to a part product
    name: { type: String },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, default: "Uncategorized" },
    subcategory: { type: String },
    image: { type: String },
    countInStock: { type: Number, default: 0 },

    // new fields
    isPart: { type: Boolean, default: false },
    partType: { type: String }, // e.g. "CPU","GPU","RAM"
    components: [componentSchema], // for assembled/custom PC saved as product
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
