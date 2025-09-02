const express = require("express");
const PcBuild = require("../models/PcBuild");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/pc-builds
// @desc    Get all PC builds (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      buildType,
      compatibilityStatus,
    } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build type filter
    if (buildType && buildType !== "all") {
      query.buildType = buildType;
    }

    // Compatibility status filter
    if (compatibilityStatus && compatibilityStatus !== "all") {
      query.compatibilityStatus = compatibilityStatus;
    }

    const builds = await PcBuild.find(query)
      .populate(
        "components.productId",
        "name price images category brand specifications"
      )
      .populate("user", "name email")
      .sort({ createdAt: -1 })
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
    console.error("Get admin builds error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/admin/pc-builds/:id
// @desc    Get a specific PC build by ID (Admin only)
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id)
      .populate(
        "components.productId",
        "name price images category brand description specifications"
      )
      .populate("user", "name email");

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    res.json(build);
  } catch (error) {
    console.error("Get admin build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/admin/pc-builds/:id
// @desc    Update a PC build (Admin only)
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      components,
      tags,
      buildType,
      isPublic,
      isCompleted,
      compatibilityStatus,
    } = req.body;

    const build = await PcBuild.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // Update fields
    if (name !== undefined) build.name = name;
    if (description !== undefined) build.description = description;
    if (components !== undefined) build.components = components;
    if (tags !== undefined) build.tags = tags;
    if (buildType !== undefined) build.buildType = buildType;
    if (isPublic !== undefined) build.isPublic = isPublic;
    if (isCompleted !== undefined) build.isCompleted = isCompleted;
    if (compatibilityStatus !== undefined)
      build.compatibilityStatus = compatibilityStatus;

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
    console.error("Admin update build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/admin/pc-builds/:id
// @desc    Delete a PC build (Admin only)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    await PcBuild.findByIdAndDelete(req.params.id);
    res.json({ message: "Build deleted successfully" });
  } catch (error) {
    console.error("Admin delete build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/admin/pc-builds/stats/overview
// @desc    Get PC builds statistics overview (Admin only)
// @access  Private/Admin
router.get("/stats/overview", protect, admin, async (req, res) => {
  try {
    const totalBuilds = await PcBuild.countDocuments();
    const publicBuilds = await PcBuild.countDocuments({ isPublic: true });
    const completedBuilds = await PcBuild.countDocuments({ isCompleted: true });
    const compatibleBuilds = await PcBuild.countDocuments({
      compatibilityStatus: "compatible",
    });

    // Get builds by type
    const buildsByType = await PcBuild.aggregate([
      {
        $group: {
          _id: "$buildType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent builds (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentBuilds = await PcBuild.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    res.json({
      totalBuilds,
      publicBuilds,
      completedBuilds,
      compatibleBuilds,
      buildsByType,
      recentBuilds,
    });
  } catch (error) {
    console.error("Get builds stats error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Add this route to allow admins to feature builds
// @route   PUT /api/pc-builds/:id/feature
// @desc    Feature a PC build (Admin only)
// @access  Private/Admin
router.put("/:id/feature", protect, admin, async (req, res) => {
  try {
    const build = await PcBuild.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    build.featured = req.body.featured;
    if (req.body.adminNotes) {
      build.adminNotes = req.body.adminNotes;
    }

    await build.save();
    res.json(build);
  } catch (error) {
    console.error("Feature build error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
