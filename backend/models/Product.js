// backend/models/Product.js
const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema(
  {
    slot: { type: String },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String },
    altText: { type: String },
    caption: { type: String },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Basic product info
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    countInStock: { type: Number, default: 0 },
    sku: { type: String, default: "" },
    category: { type: String, default: "" },
    brand: { type: String, default: "" },

    // images: frontend expects either string or array of objects; we store array of objects
    images: { type: [imageSchema], default: [] },

    // optional frontend metadata
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },

    // variant / presentation fields
    sizes: [{ type: String }],
    colors: [{ type: String }],
    collections: { type: String },
    material: { type: String },

    // PC-specific
    isPart: { type: Boolean, default: false }, // true for CPU/GPU/PSU etc
    partType: { type: String }, // e.g. "CPU", "GPU", "RAM"
    components: [componentSchema], // for prebuilt/custom PCs

    // any tags for filtering
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
