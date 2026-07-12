import { Router } from "express";
import { createAnnouncement, getAnnouncements, replyToAnnouncement, updateAnnouncement, deleteAnnouncement } from "../controllers/announcementController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getAnnouncements);
router.post("/", protect, allowRoles("admin"), createAnnouncement);
router.put("/:id", protect, allowRoles("admin"), updateAnnouncement);
router.delete("/:id", protect, allowRoles("admin"), deleteAnnouncement);
router.post("/:id/replies", protect, replyToAnnouncement);

export default router;
