import { Router } from "express";
import { createSubmission, getSubmissions, updateSubmissionStatus } from "../controllers/submissionController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getSubmissions);
router.post("/", protect, allowRoles("student"), createSubmission);
router.patch("/:id/status", protect, allowRoles("admin"), updateSubmissionStatus);

export default router;
