const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
const products = require("./data/products");

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
const seedData = async () => {
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

    const sampleProducts = products.map((product) => {
      return { ...product, user: userID };
    });

    //Insert the products into the database
    await Product.insertMany(sampleProducts);

    console.log("Product data seeded successfully");
    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Error seeding the data", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
