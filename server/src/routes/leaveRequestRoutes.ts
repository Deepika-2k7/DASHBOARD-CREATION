import { Router } from "express";
import { createLeaveRequest, getLeaveRequests, updateLeaveRequestStatus, updateLeaveRequest, deleteLeaveRequest } from "../controllers/leaveRequestController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getLeaveRequests);
router.post("/", protect, allowRoles("student"), createLeaveRequest);
router.put("/:id", protect, allowRoles("admin"), updateLeaveRequest);
router.patch("/:id/status", protect, allowRoles("admin"), updateLeaveRequestStatus);
router.delete("/:id", protect, allowRoles("admin"), deleteLeaveRequest);

export default router;
