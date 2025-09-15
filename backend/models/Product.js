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
    // Basic product info
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, default: 0 },

    // Categorization
    category: { type: String, default: "Uncategorized" },
    subcategory: { type: String },

    // Media
    images: [
      {
        url: { type: String, required: true },
      },
    ],

    // eCommerce metadata
    sku: { type: String },
    brand: { type: String },
    sizes: [{ type: String }], // e.g. ["S", "M", "L"]
    colors: [{ type: String }], // e.g. ["Red", "Blue"]
    collections: { type: String },
    material: { type: String },

    // PC part compatibility
    isPart: { type: Boolean, default: false },
    partType: { type: String }, // e.g. "CPU","GPU","RAM"
    components: [componentSchema], // for assembled/custom PC saved as product
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
