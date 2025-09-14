const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

//@route GET /api/admin/products
//@desc Get all products (Admin only)
//@access Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
});

//@route POST /api/admin/products
//@desc Create a new product (Admin only)
//@access Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const body = req.body || {};
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = body;

    // Defensive numeric coercion
    const p = price !== undefined ? Number(price) : undefined;
    const dp = discountPrice !== undefined ? Number(discountPrice) : undefined;

    if (Number.isFinite(p) && Number.isFinite(dp) && dp > p) {
      return res.status(400).json({
        message: "Validation error",
        errors: {
          discountPrice: "Discount price cannot be greater than regular price",
        },
      });
    }

    const product = new Product({
      name,
      description,
      price: p,
      discountPrice: dp,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user ? req.user._id : undefined,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    if (error && error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

//@route PUT /api/admin/products/:id
//@desc Update an existing product (Admin only)
//@access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing id parameter" });

    const body = req.body || {};
    let {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = body;

    if (price !== undefined) price = Number(price);
    if (discountPrice !== undefined) discountPrice = Number(discountPrice);

    if (
      Number.isFinite(price) &&
      Number.isFinite(discountPrice) &&
      discountPrice > price
    ) {
      return res.status(400).json({
        message: "Validation error",
        errors: {
          discountPrice: "Discount price cannot be greater than regular price",
        },
      });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (typeof name !== "undefined") product.name = name;
    if (typeof description !== "undefined") product.description = description;
    if (typeof price !== "undefined") product.price = price;
    if (typeof discountPrice !== "undefined")
      product.discountPrice = discountPrice;
    if (typeof countInStock !== "undefined")
      product.countInStock = countInStock;
    if (typeof category !== "undefined") product.category = category;
    if (typeof brand !== "undefined") product.brand = brand;
    if (typeof sizes !== "undefined") product.sizes = sizes;
    if (typeof colors !== "undefined") product.colors = colors;
    if (typeof collections !== "undefined") product.collections = collections;
    if (typeof material !== "undefined") product.material = material;
    if (typeof images !== "undefined") product.images = images;
    if (typeof isFeatured !== "undefined") product.isFeatured = isFeatured;
    if (typeof isPublished !== "undefined") product.isPublished = isPublished;
    if (typeof tags !== "undefined") product.tags = tags;
    if (typeof dimensions !== "undefined") product.dimensions = dimensions;

    if (typeof weight !== "undefined") {
      if (typeof weight === "number") {
        product.weight = { value: weight, unit: product.weight?.unit || "kg" };
      } else {
        product.weight = weight;
      }
    }

    if (typeof sku !== "undefined") product.sku = sku;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("PUT /api/admin/products/:id error:", error);
    if (error && error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

//@route DELETE /api/admin/products/:id
//@desc Delete a product by ID (Admin only)
//@access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing id parameter" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    console.error("DELETE /api/admin/products/:id error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
