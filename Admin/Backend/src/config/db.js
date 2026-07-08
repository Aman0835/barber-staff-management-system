import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ debug: false });

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    console.log("Connecting to MongoDB at :", mongoUri.replace(/:([^@]+)@/, ":****@"));
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully ");
  } catch (error) {
    console.error("Database connection error  :", error.message);
  }
};
