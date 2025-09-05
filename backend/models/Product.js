const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      // Added description field
      type: String,
      required: true,
      trim: true,
    },
    price: {
      // Added price field
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: "Discount price cannot be greater than regular price",
      },
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Laptops",
        "Mini PC",
        "Desktops",
        "All-in-One",
        "Workstations",
        "cpu",
        "gpu",
        "ram",
        "storage",
        "motherboard",
        "psu",
        "case",
        "cooling",
        "monitor",
        "keyboard",
        "mouse",
        "headset",
        "accessories",
      ],
    },
    brand: {
      type: String,
      trim: true,
    },
    sizes: {
      type: [String],
      required: true,
      validate: {
        validator: function (sizes) {
          return sizes.length > 0;
        },
        message: "At least one size is required",
      },
    },
    colors: {
      type: [String],
      required: true,
      validate: {
        validator: function (colors) {
          return colors.length > 0;
        },
        message: "At least one color is required",
      },
    },
    collections: {
      type: String,
      required: true,
      trim: true,
    },
    material: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
          validate: {
            validator: function (url) {
              return /^https?:\/\/.+\..+/.test(url);
            },
            message: "Invalid URL format",
          },
        },
        altText: {
          type: String,
          trim: true,
          default: "Product image",
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    numReviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    metaKeywords: {
      type: String,
      trim: true,
    },
    dimensions: {
      length: {
        type: Number,
        min: 0,
      },
      width: {
        type: Number,
        min: 0,
      },
      height: {
        type: Number,
        min: 0,
      },
      unit: {
        type: String,
        default: "cm",
        enum: ["cm", "inch", "mm", "m"],
      },
    },
    weight: {
      value: {
        type: Number,
        min: 0,
      },
      unit: {
        type: String,
        default: "kg",
        enum: ["kg", "g", "lb", "oz"],
      },
    },
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for checking if product is in stock
productSchema.virtual("inStock").get(function () {
  return this.countInStock > 0;
});

// Virtual for current price (considering discount)
productSchema.virtual("currentPrice").get(function () {
  return this.discountPrice || this.price;
});

// Index for better performance on common queries
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ brand: 1, isPublished: 1 });
productSchema.index({ sku: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
