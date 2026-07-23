import express from "express";
import { getMe, googleLogin, login, register, updateMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

export default router;
