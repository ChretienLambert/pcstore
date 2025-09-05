const express = require("express");
const PcBuild = require("../models/PcBuild");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/pc-builds
// @desc    Create a new PC build
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, components, tags, buildType, isPublic } =
      req.body;

    // Validate required components
    if (!name || !components || !Array.isArray(components)) {
      return res.status(400).json({
        message: "Name and components array are required",
      });
    }

    const build = new PcBuild({
      name,
      description,
      components,
      tags,
      buildType,
      isPublic,
      user: req.user._id,
    });

    // Check compatibility
    build.checkCompatibility();

    await build.save();
    await build.populate(
      "components.productId",
      "name price images category brand specifications"
    );

    res.status(201).json(build);
  } catch (error) {
    console.error("Create build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/pc-builds
// @desc    Get all public PC builds with filtering
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      buildType,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      search,
    } = req.query;

    let query = { isPublic: true };

    // Build type filter
    if (buildType && buildType !== "all") {
      query.buildType = buildType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.totalPrice = {};
      if (minPrice) query.totalPrice.$gte = Number(minPrice);
      if (maxPrice) query.totalPrice.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const builds = await PcBuild.find(query)
      .populate("components.productId", "name price images category brand")
      .populate("user", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PcBuild.countDocuments(query);

    res.json({
      builds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get builds error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/pc-builds/my-builds
// @desc    Get authenticated user's PC builds
// @access  Private
router.get("/my-builds", protect, async (req, res) => {
  try {
    const builds = await PcBuild.find({ user: req.user._id })
      .populate(
        "components.productId",
        "name price images category brand specifications"
      )
      .sort({ createdAt: -1 });

    res.json(builds);
  } catch (error) {
    console.error("Get my builds error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/pc-builds/:id
// @desc    Get a specific PC build by ID
// @access  Public (if public) or Private (if owner)
router.get("/:id", async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id)
      .populate(
        "components.productId",
        "name price images category brand description specifications"
      )
      .populate("user", "name");

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // Check if build is public or user owns it
    if (
      !build.isPublic &&
      (!req.user || build.user._id.toString() !== req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this build" });
    }

    // Increment views if it's a public build
    if (build.isPublic) {
      build.views += 1;
      await build.save();
    }

    res.json(build);
  } catch (error) {
    console.error("Get build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/pc-builds/:id
// @desc    Update a PC build
// @access  Private (owner only)
router.put("/:id", protect, async (req, res) => {
  try {
    const {
      name,
      description,
      components,
      tags,
      buildType,
      isPublic,
      isCompleted,
    } = req.body;

    const build = await PcBuild.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // Check ownership
    if (build.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    if (name !== undefined) build.name = name;
    if (description !== undefined) build.description = description;
    if (components !== undefined) build.components = components;
    if (tags !== undefined) build.tags = tags;
    if (buildType !== undefined) build.buildType = buildType;
    if (isPublic !== undefined) build.isPublic = isPublic;
    if (isCompleted !== undefined) build.isCompleted = isCompleted;

    // Recheck compatibility if components were updated
    if (components !== undefined) {
      build.checkCompatibility();
    }

    await build.save();
    await build.populate(
      "components.productId",
      "name price images category brand specifications"
    );

    res.json(build);
  } catch (error) {
    console.error("Update build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/pc-builds/:id
// @desc    Delete a PC build
// @access  Private (owner only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    if (build.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await PcBuild.findByIdAndDelete(req.params.id);
    res.json({ message: "Build deleted successfully" });
  } catch (error) {
    console.error("Delete build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/pc-builds/:id/components
// @desc    Add a component to a build
// @access  Private (owner only)
router.post("/:id/components", protect, async (req, res) => {
  try {
    const { productId, category, quantity, notes } = req.body;

    const build = await PcBuild.findById(req.params.id);
    const product = await Product.findById(productId);

    if (!build) return res.status(404).json({ message: "Build not found" });
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (build.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    build.components.push({
      productId,
      category,
      quantity: quantity || 1,
      notes,
    });

    build.checkCompatibility();
    await build.save();
    await build.populate(
      "components.productId",
      "name price images category brand specifications"
    );

    res.json(build);
  } catch (error) {
    console.error("Add component error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/pc-builds/:id/components/:componentId
// @desc    Update a component in a build
// @access  Private (owner only)
router.put("/:id/components/:componentId", protect, async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const build = await PcBuild.findById(req.params.id);

    if (!build) return res.status(404).json({ message: "Build not found" });
    if (build.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const component = build.components.id(req.params.componentId);
    if (!component)
      return res.status(404).json({ message: "Component not found" });

    if (quantity !== undefined) component.quantity = quantity;
    if (notes !== undefined) component.notes = notes;

    build.checkCompatibility();
    await build.save();
    await build.populate(
      "components.productId",
      "name price images category brand specifications"
    );

    res.json(build);
  } catch (error) {
    console.error("Update component error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/pc-builds/:id/components/:componentId
// @desc    Remove a component from a build
// @access  Private (owner only)
router.delete("/:id/components/:componentId", protect, async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id);

    if (!build) return res.status(404).json({ message: "Build not found" });
    if (build.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    build.components = build.components.filter(
      (comp) => comp._id.toString() !== req.params.componentId
    );

    build.checkCompatibility();
    await build.save();
    await build.populate(
      "components.productId",
      "name price images category brand specifications"
    );

    res.json(build);
  } catch (error) {
    console.error("Remove component error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/pc-builds/:id/like
// @desc    Like/unlike a public build
// @access  Private
router.post("/:id/like", protect, async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id);

    if (!build || !build.isPublic) {
      return res.status(404).json({ message: "Build not found or not public" });
    }

    const likeIndex = build.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      build.likes.push(req.user._id);
    } else {
      build.likes.splice(likeIndex, 1);
    }

    await build.save();
    res.json({ liked: likeIndex === -1, likeCount: build.likes.length });
  } catch (error) {
    console.error("Like build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/pc-builds/user/:userId
// @desc    Get public builds by a specific user
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const builds = await PcBuild.find({
      user: req.params.userId,
      isPublic: true,
    })
      .populate("components.productId", "name price images category brand")
      .sort({ createdAt: -1 });

    res.json(builds);
  } catch (error) {
    console.error("Get user builds error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
// @route GET /api/pc-builds/:id/checkout-details
// @desc Get PC build details for checkout
// @access Private
router.get("/:id/checkout-details", protect, async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id).populate(
      "components.productId",
      "name price images"
    );

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // Check authorization
    if (build.user.toString() !== req.user._id.toString() && !build.isPublic) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Calculate total price
    const totalPrice = build.components.reduce((total, component) => {
      return total + component.productId.price * component.quantity;
    }, 0);

    // heckout items
    const checkoutItems = build.components.map((component) => ({
      productId: component.productId._id,
      name: component.productId.name,
      image: component.productId.images[0]?.url || "",
      price: component.productId.price,
      quantity: component.quantity,
    }));

    res.json({
      build: {
        _id: build._id,
        name: build.name,
        description: build.description,
      },
      checkoutItems,
      totalPrice,
      estimatedWattage: build.estimatedWattage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
