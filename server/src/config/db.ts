import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI || env.mongoUri;

  if (!mongoUri) {
    console.warn("MongoDB connection skipped because MONGODB_URI is missing.");
    return false;
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
  return true;
};
