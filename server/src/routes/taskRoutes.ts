import { Router } from "express";
import { completeTask, createTask, getTasks, getTodayTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTasks);
router.get("/today", protect, getTodayTask);
router.post("/", protect, allowRoles("admin"), createTask);
router.post("/:id/complete", protect, allowRoles("student"), completeTask);
router.put("/:id", protect, allowRoles("admin"), updateTask);
router.delete("/:id", protect, allowRoles("admin"), deleteTask);

export default router;
