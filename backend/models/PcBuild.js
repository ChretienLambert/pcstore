const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ],
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
});

const pcBuildSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    components: [componentSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    compatibilityStatus: {
      type: String,
      enum: ["compatible", "incompatible", "needs_review"],
      default: "needs_review",
    },
    compatibilityIssues: [
      {
        componentId: mongoose.Schema.Types.ObjectId,
        issue: String,
        severity: {
          type: String,
          enum: ["warning", "error"],
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    buildType: {
      type: String,
      enum: ["gaming", "workstation", "budget", "high-end", "custom"],
      default: "custom",
    },
    estimatedWattage: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    gallery: [
      {
        url: String,
        caption: String,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
pcBuildSchema.index({ user: 1, createdAt: -1 });
pcBuildSchema.index({ isPublic: 1, rating: -1 });
pcBuildSchema.index({ buildType: 1, totalPrice: 1 });

// Virtual for like count - FIXED with null checking
pcBuildSchema.virtual("likeCount").get(function () {
  if (!this.likes || !Array.isArray(this.likes)) {
    return 0;
  }
  return this.likes.length;
});

// Virtual for calculated total price - FIXED with proper null checking
pcBuildSchema.virtual("calculatedTotal").get(function () {
  if (!this.components || !Array.isArray(this.components)) {
    return 0;
  }

  return this.components.reduce((total, component) => {
    // Check if productId is populated and has a price
    if (
      component.productId &&
      typeof component.productId === "object" &&
      "price" in component.productId
    ) {
      return total + component.productId.price * component.quantity;
    }
    return total;
  }, 0);
});

// Method to check compatibility (basic implementation)
pcBuildSchema.methods.checkCompatibility = function () {
  const issues = [];

  // Check if components exist and is an array
  if (!this.components || !Array.isArray(this.components)) {
    issues.push({
      componentId: null,
      issue: "No components found in build",
      severity: "error",
    });
    this.compatibilityIssues = issues;
    this.compatibilityStatus = "incompatible";
    return issues;
  }

  // Check if all required component types are present
  const requiredComponents = ["cpu", "motherboard", "ram", "psu", "case"];
  const presentComponents = new Set(this.components.map((c) => c.category));

  requiredComponents.forEach((comp) => {
    if (!presentComponents.has(comp)) {
      issues.push({
        componentId: null,
        issue: `Missing required component: ${comp}`,
        severity: "error",
      });
    }
  });

  // Basic compatibility checks can be added here
  // Example: Check if CPU socket matches motherboard, RAM compatibility, etc.

  this.compatibilityIssues = issues;
  this.compatibilityStatus =
    issues.length === 0 ? "compatible" : "incompatible";

  return issues;
};

// Pre-save middleware to handle virtuals safely
pcBuildSchema.pre("save", function (next) {
  // Ensure components is always an array
  if (!this.components) {
    this.components = [];
  }

  // Ensure likes is always an array
  if (!this.likes) {
    this.likes = [];
  }

  next();
});

module.exports = mongoose.model("PcBuild", pcBuildSchema);
