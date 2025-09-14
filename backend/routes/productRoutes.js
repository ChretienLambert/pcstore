const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Helpers: validate ObjectId and normalize incoming id values
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(String(id));
};

const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid id parameter" });
  }
  next();
};

const normalizeIds = (maybeIds) => {
  if (!maybeIds) return [];
  if (!Array.isArray(maybeIds)) maybeIds = [maybeIds];
  return maybeIds
    .map((v) => {
      if (!v) return null;
      if (typeof v === "object") return v._id || v.id || null;
      return String(v);
    })
    .filter(Boolean)
    .filter((id) => isValidObjectId(id));
};

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

    // Coerce numeric fields defensively
    if (price !== undefined) price = Number(price);
    if (discountPrice !== undefined) discountPrice = Number(discountPrice);

    // Validate discount <= price when both present
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

    console.debug("product update body:", body, "id:", req.params.id);

    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (product) {
      // Update only when the incoming value is provided (allow falsy values)
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
      // handle weight: accept number (set value) or object
      if (typeof weight !== "undefined") {
        if (typeof weight === "number") {
          product.weight = {
            value: weight,
            unit: product.weight?.unit || "kg",
          };
        } else {
          product.weight = weight;
        }
      }
      if (typeof sku !== "undefined") product.sku = sku;

      // Save the updated product (this will run schema validators)
      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    // Surface validation errors as 400 so the client can handle them
    if (error && error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message || "Validation error",
        errors: error.errors,
      });
    }
    res.status(500).send("Server Error");
  }
});

//@route DELETE /api/products/:id
//@desc Delete a product by ID
//@access Private/admin
router.delete("/:id", protect, admin, async (req, res) => {
  // Fixed the route path
  try {
    //Find the product by ID
    const product = await Product.findById(req.params.id);

    if (product) {
      //Remove the product from the DB
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//@route GET /api/products
//@des Get all the product with optional query filter
//@access Public
router.get("/", async (req, res) => {
  try {
    const {
      collection,
      category,
      sortBy,
      minPrice,
      maxPrice,
      size,
      color,
      search,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    // Filter logic (fixed typos and robust parsing)
    if (collection && collection.toLowerCase() !== "all") {
      query.collections = collection;
    }
    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }
    if (material) {
      query.material = { $in: material.split(",").map((m) => m.trim()) };
    }
    if (brand) {
      query.brand = { $in: brand.split(",").map((m) => m.trim()) };
    }
    if (size) {
      query.sizes = { $in: size.split(",").map((m) => m.trim()) };
    }
    if (color) {
      query.colors = { $in: color.split(",").map((m) => m.trim()) };
    }

    // Price range parsing (defensive)
    const parseNumber = (v) => {
      if (typeof v !== "string" && typeof v !== "number") return NaN;
      // remove common formatting like commas and currency symbols
      const cleaned = String(v)
        .replace(/[, $£€]/g, "")
        .trim();
      return parseFloat(cleaned);
    };

    const min = parseNumber(minPrice);
    const max = parseNumber(maxPrice);

    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      query.price = {};
      if (Number.isFinite(min)) query.price.$gte = min;
      if (Number.isFinite(max)) query.price.$lte = max;
      // if both are invalid, remove price filter
      if (Object.keys(query.price).length === 0) delete query.price;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // debug log to inspect final query (remove in production)
    // verbose debug logs removed

    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit) || 0);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
//access GET /api/products/new-arrivals
//@desc Retrieve latest 8 products - Creation date
//@access Public
router.get("/new-arrivals", async (req, res) => {
  try {
    //Fetch latest 8 products
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
});

//@route GET /api/products/best-seller
//@desc Retrieve the product with the highest rating
//@access Public
router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    if (bestSeller) {
      res.json(bestSeller);
    } else {
      res.status(404).json({ message: "No best seller found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
});

// Example: apply validateIdParam to routes that use :id
router.get("/:id", validateIdParam, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Example: guard before using an incoming _id in any query
router.post("/bulk", async (req, res) => {
  try {
    const ids = normalizeIds(req.body.ids || req.query.ids);
    if (!ids.length)
      return res.status(400).json({ message: "No valid ids provided" });
    const products = await Product.find({ _id: { $in: ids } });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Example: before using an id from params/query/body
// if (req.params.id) {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return res.status(400).json({ message: 'Invalid product id' });
//   }
// }

// If you accept arrays/objects from the client, normalize to an array of id strings:
// const normalizeIds = (maybeIds) => {
//   if (!maybeIds) return [];
//   if (!Array.isArray(maybeIds)) maybeIds = [maybeIds];
//   return maybeIds
//     .map((v) => {
//       if (!v) return null;
//       // if client sent object like { _id: '...' } or full doc, extract _id
//       if (typeof v === 'object') return v._id || v.id || null;
//       return String(v);
//     })
//     .filter(Boolean)
//     .filter((id) => mongoose.Types.ObjectId.isValid(id));
// };

// Example usage when building a query that uses _id:
// const ids = normalizeIds(req.body.ids || req.query.ids);
// if (ids.length) {
//   query._id = { $in: ids };
// }

//@route GET /api/products/similar/:id
//@desc Retrieve similar products by product ID
//@access Public
router.get("/similar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(200).json([]); // prefer 200 + empty array
    // compute similar products ...
    const similar = await Product.find({
      /* your criteria */
    }).limit(8);
    return res.status(200).json(similar || []);
  } catch (err) {
    console.error("GET /api/products/similar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// (Removed duplicate unprotected POST/PUT handlers — use the admin-protected handlers above)

module.exports = router;
