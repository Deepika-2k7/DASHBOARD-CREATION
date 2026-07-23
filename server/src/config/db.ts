import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  const mongoUri = env.mongoUri;

  if (!mongoUri) {
    console.warn("MongoDB connection skipped because MONGODB_URI is missing.");
    return false;
  }

  await mongoose.connect(mongoUri, {
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000)
  });
  console.log("MongoDB connected");
  return true;
};
