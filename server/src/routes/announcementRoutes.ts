import { Router } from "express";
import { createAnnouncement, deleteAnnouncement, getAnnouncements, markAnnouncementsRead, replyToAnnouncement, updateAnnouncement } from "../controllers/announcementController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getAnnouncements);
router.patch("/read", protect, markAnnouncementsRead);
router.post("/", protect, allowRoles("admin"), createAnnouncement);
router.put("/:id", protect, allowRoles("admin"), updateAnnouncement);
router.delete("/:id", protect, allowRoles("admin"), deleteAnnouncement);
router.post("/:id/replies", protect, replyToAnnouncement);

export default router;
