const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    // defensive: avoid crash when req.body is undefined
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
    } = body; // <-- use body here, not req.body


    const product = new Product({
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
      user: req.user._id, //Reference to the admin creating the product
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error!");
  }
});

//@route PUT /api/products/:id
//desc Update an existing ID
//@access Private Admin
router.put("/:id", protect, admin, async (req, res) => {
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

    console.debug("product update body:", body, "id:", req.params.id);

    //Find the product by ID
    const product = await Product.findById(req.params.id);
    if (product) {
      // Update only when the incoming value is provided (allow falsy values)
      if (typeof name !== "undefined") product.name = name;
      if (typeof description !== "undefined") product.description = description;
      if (typeof price !== "undefined") product.price = price;
      if (typeof discountPrice !== "undefined") product.discountPrice = discountPrice;
      if (typeof countInStock !== "undefined") product.countInStock = countInStock;
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
      // handle weight: accept number (set value) or object
      if (typeof weight !== "undefined") {
        if (typeof weight === "number") {
          product.weight = { value: weight, unit: product.weight?.unit || "kg" };
        } else {
          product.weight = weight;
        }
      }
      if (typeof sku !== "undefined") product.sku = sku;

      //Save the update product
      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
