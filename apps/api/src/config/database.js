// layboka/apps/api/src/config/database.js
import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB Atlas
 */
const connectDatabase = async () => {
  try {
    if (isConnected) {
      console.log("✅ MongoDB already connected");
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: process.env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      minPoolSize: 5,
      retryWrites: true
    });

    isConnected = connection.connections[0].readyState === 1;

    console.log("======================================");
    console.log("🍃 MongoDB Connected Successfully");
    console.log(`📂 Database : ${connection.connection.name}`);
    console.log(`🖥️ Host      : ${connection.connection.host}`);
    console.log("======================================");

    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB Error:", error.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB Reconnected");
      isConnected = true;
    });

  } catch (error) {
    console.error("======================================");
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    console.error("======================================");
    process.exit(1);
  }
};

export default connectDatabase;
