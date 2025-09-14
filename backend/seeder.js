const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
let products = require("./data/products");

dotenv.config();

// pick up either env name
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error(
    "MONGO_URI / MONGODB_URI is not set. Add it to .env or export it."
  );
  process.exit(1);
}

// Connect to mongoDB
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

//Function to seed data
async function seedData() {
  try {
    //Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    //Create a default admin user
    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "123456",
      role: "admin",
    });

    //Assign the default user ID to each product (use field name `user`)
    const userID = createdUser._id;

    // Normalize each product to satisfy existing schema validators
    products = products.map((p, idx) => {
      const prod = { ...p };

      // Fix collections field - ensure it's a string, not array
      if (prod.collections) {
        if (Array.isArray(prod.collections)) {
          prod.collections = prod.collections[0]; // Take first element
        }
        prod.collections = String(prod.collections);
      } else {
        prod.collections = prod.category ? String(prod.category) : "all";
      }

      // Add the required user field
      prod.user = userID;

      // ensure sku (was required)
      if (!prod.sku) {
        prod.sku = `SKU-${(prod.name || "ITEM")
          .toString()
          .replace(/\s+/g, "-")
          .slice(0, 20)}-${Date.now().toString().slice(-5)}-${idx}`;
      }

      // ensure sizes/colors validators pass (provide minimal placeholders)
      if (
        !prod.sizes ||
        !Array.isArray(prod.sizes) ||
        prod.sizes.length === 0
      ) {
        prod.sizes = ["One Size"];
      }
      if (
        !prod.colors ||
        !Array.isArray(prod.colors) ||
        prod.colors.length === 0
      ) {
        prod.colors = ["Default"];
      }

      // ensure numeric fields
      if (typeof prod.price === "undefined") prod.price = prod.price || 0;
      if (typeof prod.countInStock === "undefined")
        prod.countInStock = prod.countInStock || 0;

      // For your new fields (parts / components) keep them if present
      // prod.isPart, prod.partType, prod.components remain unchanged

      return prod;
    });

    //Insert the products into the database
    await Product.insertMany(products);

    console.log("Product data seeded successfully");
    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Error seeding the data", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedData();
