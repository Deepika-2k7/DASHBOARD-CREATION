import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

const mongoUri = process.env.MONGODB_URI?.trim() || "";
const jwtSecret = process.env.JWT_SECRET?.trim() || "replace-with-a-secure-secret";

if (!mongoUri) {
  console.warn(`MONGODB_URI is not set. Skipping MongoDB connection. Expected .env at ${envPath}`);
}

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Using insecure fallback value for local development.");
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri,
  jwtSecret,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
};
