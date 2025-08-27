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
    console.debug(
      "products query:",
      JSON.stringify(query),
      "sortBy:",
      sortBy,
      "limit:",
      limit
    );
    console.debug("final query", JSON.stringify(query));
    console.debug(
      "inspect first 5 docs:",
      await Product.find().limit(5).lean()
    );

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

//@route GET /api/products/:id
//@desc Get a single product by ID
//@access Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
//@route GET /api/product/similar/:id
//@desc Retrieve similar products based on the currents product's gender and category
//@access Public
router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const similarProducts = await Product.find({
      _id: { $ne: id },
      gender: product.gender,
      category: product.category,
    }).limit(4);
    res.json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
