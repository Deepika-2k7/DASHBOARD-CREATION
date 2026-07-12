import { Router } from "express";
import { getSchedule, saveSchedule, updateSchedule, deleteSchedule } from "../controllers/scheduleController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getSchedule);
router.put("/", protect, allowRoles("admin"), saveSchedule);
router.put("/:id", protect, allowRoles("admin"), updateSchedule);
router.delete("/:id", protect, allowRoles("admin"), deleteSchedule);

export default router;
