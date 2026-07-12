import { Router } from "express";
import { createPoll, getPolls, submitPollResponse, updatePoll, deletePoll } from "../controllers/pollController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getPolls);
router.post("/", protect, allowRoles("admin"), createPoll);
router.put("/:id", protect, allowRoles("admin"), updatePoll);
router.delete("/:id", protect, allowRoles("admin"), deletePoll);
router.post("/:id/respond", protect, allowRoles("student"), submitPollResponse);

export default router;
