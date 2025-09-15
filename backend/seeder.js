// backend/seeder.js
// Robust seeder — deletes products, orders, carts, checkouts, subscribers & (optionally) users, then inserts ./data/products
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Models
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Checkout = require("./models/Checkout");
const Subscriber = require("./models/Subscriber");

// Products data
let products = require("./data/products");

// Pick up either CLI arg or env var
const cliMongo = process.argv[2];
const mongoUri = cliMongo || process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error(
    "ERROR: MONGO_URI / MONGODB_URI is not set. Provide it via:\n" +
      "  - CLI:    node seeder.js <mongoUri>\n" +
      "  - .env:   MONGO_URI=your_uri OR MONGODB_URI=your_uri\n" +
      "  - envvar: export MONGO_URI=your_uri"
  );
  process.exit(1);
}

// Optional: preserve existing users if set
const PRESERVE_USERS = String(process.env.PRESERVE_USERS || "").toLowerCase() === "true";

async function connectDB() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB for seeding");
  } catch (err) {
    console.error("MongoDB connection failed:", err && err.message ? err.message : err);
    process.exit(1);
  }
}

async function safeClear(model, name) {
  try {
    await model.deleteMany();
    console.log(`${name} collection cleared.`);
  } catch (err) {
    console.warn(`Failed to clear ${name} collection:`, err && err.message ? err.message : err);
  }
}

async function seedData() {
  try {
    // Clear main collections used by the app
    await safeClear(Product, "Products");
    await safeClear(Order, "Orders");
    await safeClear(Cart, "Carts");
    await safeClear(Checkout, "Checkouts");
    await safeClear(Subscriber, "Subscribers");

    if (!PRESERVE_USERS) {
      await safeClear(User, "Users");
    } else {
      console.log("PRESERVE_USERS=true : users collection will NOT be cleared.");
    }

    // Create or obtain an admin user to attach to products
    let adminUser = null;
    if (!PRESERVE_USERS) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "123456",
        role: "admin",
      });
      console.log("Default admin user created:", adminUser.email);
    } else {
      // Try to find an admin user; if none exist, create one
      adminUser = await User.findOne({ role: "admin" });
      if (!adminUser) {
        console.log("No admin user found — creating default admin user.");
        adminUser = await User.create({
          name: "Admin User",
          email: "admin@example.com",
          password: "123456",
          role: "admin",
        });
      } else {
        console.log("Found existing admin user:", adminUser.email);
      }
    }

    const userID = adminUser ? adminUser._id : null;

    // Normalize each product to satisfy schema validators
    products = products.map((p, idx) => {
      const prod = { ...p };

      // ensure collections is a string
      if (prod.collections) {
        if (Array.isArray(prod.collections)) prod.collections = String(prod.collections[0] || "");
        else prod.collections = String(prod.collections);
      } else {
        prod.collections = prod.category ? String(prod.category) : "all";
      }

      // ensure user field (required by some frontends)
      if (userID) prod.user = userID;

      // ensure sku exists
      if (!prod.sku) {
        const nameSlug = (prod.name || "ITEM").toString().replace(/\s+/g, "-").slice(0, 20);
        prod.sku = `SKU-${nameSlug}-${Date.now().toString().slice(-5)}-${idx}`;
      }

      // sizes / colors defaults (match Product model validators)
      if (!prod.sizes || !Array.isArray(prod.sizes) || prod.sizes.length === 0)
        prod.sizes = ["One Size"];
      if (!prod.colors || !Array.isArray(prod.colors) || prod.colors.length === 0)
        prod.colors = ["Default"];

      // numeric defaults
      if (typeof prod.price === "undefined" || prod.price === null) prod.price = 0;
      if (typeof prod.countInStock === "undefined" || prod.countInStock === null) prod.countInStock = 0;
      if (typeof prod.discountPrice === "undefined" || prod.discountPrice === null) prod.discountPrice = 0;

      // make sure images is an array of objects or strings acceptable to frontend
      if (!prod.images) prod.images = [];
      if (!Array.isArray(prod.images)) prod.images = [prod.images];

      // Ensure tags is array
      if (!prod.tags) prod.tags = [];
      if (!Array.isArray(prod.tags)) prod.tags = [String(prod.tags || "")];

      // Keep isPart, partType and components if present (no changes)
      return prod;
    });

    // Insert products
    const createdProducts = await Product.insertMany(products, { ordered: false });
    console.log(`Products seeded successfully: ${createdProducts.length} inserted.`);

    await mongoose.connection.close();
    console.log("MongoDB connection closed. Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding the data:", error && error.message ? error.message : error);
    try {
      await mongoose.connection.close();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

// Handle termination signals cleanly
process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing MongoDB connection...");
  try {
    await mongoose.connection.close();
  } catch (e) {}
  process.exit(0);
});

(async () => {
  await connectDB();
  await seedData();
})();
