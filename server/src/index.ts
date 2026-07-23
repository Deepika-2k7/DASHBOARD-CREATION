import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import leaveRequestRoutes from "./routes/leaveRequestRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
const port = env.port;
const clientUrl = env.clientUrl;
const uploadsRootDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR || "uploads");

console.log("[SERVER] Starting server initialization...");
console.log("[SERVER] Port:", port);
console.log("[SERVER] Client URL:", clientUrl);
console.log("[SERVER] MongoDB URI configured:", env.mongoUri ? "✓ YES" : "✗ NO - MISSING");

app.set("trust proxy", 1);
app.use(cors({ origin: clientUrl }));
console.log("[SERVER] CORS enabled for:", clientUrl);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsRootDir));
console.log("[SERVER] Uploads folder served at /uploads");

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    const bodyLog = { ...req.body };
    if (bodyLog.password) bodyLog.password = "[REDACTED]";
    console.log("[REQUEST BODY]", bodyLog);
  }
  next();
});

app.get("/api/health", (_req, res) => {
  console.log("[HEALTH CHECK] Request received");
  res.json({ ok: true, message: "Server is running" });
});

console.log("[SERVER] Registering routes...");
app.use("/api/auth", authRoutes);
console.log("[SERVER] ✓ Auth routes registered");
app.use("/api/tasks", taskRoutes);
console.log("[SERVER] ✓ Tasks routes registered");
app.use("/api/submissions", submissionRoutes);
console.log("[SERVER] ✓ Submissions routes registered");
app.use("/api/leaderboard", leaderboardRoutes);
console.log("[SERVER] ✓ Leaderboard routes registered");
app.use("/api/announcements", announcementRoutes);
console.log("[SERVER] ✓ Announcements routes registered");
app.use("/api/leave-requests", leaveRequestRoutes);
console.log("[SERVER] ✓ Leave requests routes registered");
app.use("/api/resources", resourceRoutes);
console.log("[SERVER] ✓ Resources routes registered");
app.use("/api/polls", pollRoutes);
console.log("[SERVER] ✓ Polls routes registered");
app.use("/api/schedule", scheduleRoutes);
console.log("[SERVER] ✓ Schedule routes registered");

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[ERROR HANDLER] Exception caught:", err.message);
  console.error("[ERROR HANDLER] Stack:", err.stack);
  res.status(500).json({ message: "Server error" });
});

export const initializeDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  console.log("[DATABASE] Connecting to MongoDB...");
  console.log("[DATABASE] URI configured:", env.mongoUri ? "YES" : "NO");

  const connected = await connectDb();
  if (!connected) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  console.log("[DATABASE] ✓ Successfully connected to MongoDB");
  console.log("[DATABASE] Connection state:", mongoose.connection.readyState);
  console.log("[DATABASE] Database name:", mongoose.connection.db?.databaseName || "unknown");
};

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log("[SERVER] ✓ Server is running!");
      console.log("[SERVER] API Base URL: http://localhost:" + port + "/api");
      console.log("[SERVER] Health check: http://localhost:" + port + "/api/health");
      console.log("[SERVER] Login endpoint: POST http://localhost:" + port + "/api/auth/login");
      console.log("[SERVER] ═══════════════════════════════════════════════════");
      console.log("[SERVER] Ready to accept requests!");
    });
  } catch (error) {
    console.error("[SERVER] ✗ Failed to start server");
    console.error("[ERROR]", error instanceof Error ? error.message : error);
    if (error instanceof Error) {
      console.error("[ERROR] Stack:", error.stack);
    }
    process.exit(1);
  }
};

if (process.env.VERCEL !== "1") {
  void startServer();
}

export { app };
