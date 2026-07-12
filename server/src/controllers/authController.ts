import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AuthRequest } from "../types.js";
import { signToken } from "../utils/jwt.js";

const buildAuthPayload = (user: any) => {
  const role = user.role === "admin" ? "admin" : "student";

  return {
    token: signToken({ userId: String(user._id), role }),
    user: {
      id: user._id,
      name: user.name || user.username,
      username: user.username,
      registerNumber: user.registerNumber || "",
      role
    }
  };
};

export const register = async (req: Request, res: Response) => {
  try {
    console.log("[REGISTER] Request received");
    console.log("[REGISTER] Request body keys:", Object.keys(req.body));

    const { name, username, registerNumber, password, role } = req.body as {
      name?: string;
      username?: string;
      registerNumber?: string;
      password?: string;
      role?: "admin" | "student";
    };

    // Log received fields
    console.log("[REGISTER] Field validation:");
    console.log("[REGISTER]   - name:", name ? `[${name}]` : "[MISSING]");
    console.log("[REGISTER]   - username:", username ? `[${username}]` : "[MISSING]");
    console.log("[REGISTER]   - registerNumber:", registerNumber ? `[${registerNumber}]` : "[EMPTY/OPTIONAL]");
    console.log("[REGISTER]   - password:", password ? "[PRESENT]" : "[MISSING]");
    console.log("[REGISTER]   - role:", role ? `[${role}]` : "[MISSING - will default to 'student']");

    if (!username || !password) {
      console.log("[REGISTER] ✗ Validation failed - missing required fields");
      console.log("[REGISTER] Missing: username=" + (!username) + ", password=" + (!password));
      return res.status(400).json({ message: "Missing fields" });
    }

    console.log("[REGISTER] ✓ Required fields present");

    const normalizedUsername = username.trim().toLowerCase();
    console.log("[REGISTER] Normalized username:", normalizedUsername);

    console.log("[REGISTER] Checking for existing user...");
    const existingUser = await User.findOne({ username: normalizedUsername });

    if (existingUser) {
      console.log("[REGISTER] ✗ User already exists:", normalizedUsername);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("[REGISTER] ✓ Username is available");

    console.log("[REGISTER] Starting password hashing with bcrypt...");
    console.log("[REGISTER] Password length:", password.length);
    
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("[REGISTER] ✓ Password hashed successfully");
      console.log("[REGISTER] Hash length:", hashedPassword.length);
      console.log("[REGISTER] Hash starts with:", hashedPassword.substring(0, 10));
    } catch (hashError) {
      console.error("[REGISTER] ✗ Password hashing FAILED:", {
        message: hashError instanceof Error ? hashError.message : "Unknown error",
        error: hashError,
        passwordType: typeof password,
        passwordLength: password?.length || 0
      });
      throw new Error("Password hashing failed: " + (hashError instanceof Error ? hashError.message : "Unknown"));
    }

    console.log("[REGISTER] Creating new User document...");
    const newUser = new User({
      name: name?.trim() || normalizedUsername,
      username: normalizedUsername,
      registerNumber: registerNumber?.trim() || "",
      password: hashedPassword,
      role: role === "admin" ? "admin" : "student"
    });

    console.log("[REGISTER] User document created, attempting save to database...");
    console.log("[REGISTER] Saving user with fields:", {
      name: newUser.name,
      username: newUser.username,
      registerNumber: newUser.registerNumber,
      password: "[HASHED]",
      role: newUser.role
    });

    let savedUser;
    try {
      savedUser = await newUser.save();
      console.log("[REGISTER] ✓ User saved successfully to MongoDB");
      console.log("[REGISTER] New user ID:", savedUser._id);
      console.log("[REGISTER] Saved user data:", {
        id: savedUser._id,
        username: savedUser.username,
        role: savedUser.role
      });
    } catch (saveError: any) {
      console.error("[REGISTER] ✗ Database save FAILED:");
      console.error("[REGISTER] Error code:", saveError.code);
      console.error("[REGISTER] Error name:", saveError.name);
      console.error("[REGISTER] Error message:", saveError.message);
      console.error("[REGISTER] Full error:", saveError);

      // Log MongoDB-specific errors
      if (saveError.code === 11000) {
        console.error("[REGISTER] ERROR TYPE: Duplicate key violation");
        console.error("[REGISTER] Duplicate field(s):", Object.keys(saveError.keyPattern));
        console.error("[REGISTER] Duplicate value(s):", saveError.keyValue);
      }

      throw saveError;
    }

    if (!savedUser?._id) {
      console.error("[REGISTER] ✗ User saved but no _id returned");
      throw new Error("User save completed without returning a document id.");
    }

    console.log("[REGISTER] ✓ Registration completed successfully");

    return res.status(201).json({
      message: "User created successfully",
      collection: User.collection.name,
      user: {
        id: savedUser._id,
        name: savedUser.name || savedUser.username,
        username: savedUser.username,
        registerNumber: savedUser.registerNumber || "",
        role: savedUser.role === "admin" ? "admin" : "student"
      }
    });
  } catch (error: any) {
    console.error("[REGISTER] ✗✗✗ REGISTRATION FAILED ✗✗✗");
    console.error("[REGISTER] Exception type:", error?.constructor?.name);
    console.error("[REGISTER] Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("[REGISTER] Error code:", error?.code);
    console.error("[REGISTER] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: error?.code,
      name: error?.name,
      keyPattern: error?.keyPattern,
      keyValue: error?.keyValue,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error("[REGISTER] Request body (password redacted):", {
      ...req.body,
      password: req.body?.password ? "[REDACTED]" : "[MISSING]"
    });
    console.error("[REGISTER] Full error object:", error);

    // Specific error handling
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      console.error("[REGISTER] Response: Duplicate key error for field:", duplicateField);
      return res.status(409).json({
        message: `${duplicateField || "username"} already exists.`,
        collection: User.collection.name,
        field: duplicateField || "username"
      });
    }

    if (error?.name === "ValidationError") {
      console.error("[REGISTER] Response: Mongoose validation error");
      const messages = Object.values(error.errors || {})
        .map((err: any) => err.message)
        .join(", ");
      return res.status(400).json({
        message: "Validation failed: " + messages,
        collection: User.collection.name
      });
    }

    console.error("[REGISTER] Response: Generic server error");
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
      collection: User.collection.name
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log("[LOGIN] Request received");
    console.log("[LOGIN] Request body keys:", Object.keys(req.body));
    
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    console.log("[LOGIN] Received username:", username ? `[${username}]` : "[MISSING]");
    console.log("[LOGIN] Received password:", password ? "[PRESENT]" : "[MISSING]");

    if (!username || !password) {
      console.log("[LOGIN] Validation failed - missing credentials");
      return res.status(400).json({ message: "Username and password are required." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    console.log("[LOGIN] Normalized username:", normalizedUsername);
    console.log("[LOGIN] Querying database for user...");

    const user = await User.findOne({ username: normalizedUsername });
    
    if (!user) {
      console.log("[LOGIN] User not found in database:", normalizedUsername);
      return res.status(401).json({ message: "Incorrect username or password." });
    }

    console.log("[LOGIN] User found, ID:", user._id);
    console.log("[LOGIN] Comparing passwords with bcrypt...");
    console.log("[LOGIN] Stored password hash exists:", !!user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("[LOGIN] Password comparison result:", isMatch);
    
    if (!isMatch) {
      console.log("[LOGIN] Password mismatch for user:", normalizedUsername);
      return res.status(401).json({ message: "Incorrect username or password." });
    }

    console.log("[LOGIN] Authentication successful, building payload...");
    const payload = buildAuthPayload(user);
    console.log("[LOGIN] Response payload prepared, sending:", { userId: payload.user.id, username: payload.user.username, role: payload.user.role });
    
    return res.json(payload);
  } catch (error) {
    console.error("[LOGIN] EXCEPTION CAUGHT:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    console.error("[LOGIN] Full error object:", error);
    return res.status(500).json({ message: "Server error - check console logs" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user);
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, password, registerNumber } = req.body as {
      name?: string;
      password?: string;
      registerNumber?: string;
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (typeof name === "string") {
      user.name = name.trim();
    }

    if (typeof registerNumber === "string") {
      user.registerNumber = registerNumber.trim();
    }

    if (password?.trim()) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.json({
      id: user._id,
      name: user.name || user.username,
      username: user.username,
      registerNumber: user.registerNumber || "",
      role: user.role === "admin" ? "admin" : "student"
    });
  } catch (error) {
    console.error("UPDATE ME ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
