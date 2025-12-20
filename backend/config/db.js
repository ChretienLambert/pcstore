const mongoose = require('mongoose');

// In serverless environments you should reuse connections across invocations
// to avoid opening a new connection on every cold start.
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set in environment');
    }

    if (mongoose.connection.readyState === 1) {
      // Already connected
      console.log('Using existing MongoDB connection');
      return;
    }

    await mongoose.connect(uri, {
      // Mongoose v8 uses sensible defaults; adjust if needed
      serverSelectionTimeoutMS: 30000,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Do not call process.exit in serverless environments; rethrow so the caller can handle it
    throw error;
  }
}

module.exports = connectDB;