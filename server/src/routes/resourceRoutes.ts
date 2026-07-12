import { Router } from "express";
import multer from "multer";
import { createResource, getResources, updateResource, deleteResource } from "../controllers/resourceController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.get("/", protect, getResources);
router.post("/", protect, allowRoles("admin"), upload.array("files"), createResource);
router.put("/:id", protect, allowRoles("admin"), updateResource);
router.delete("/:id", protect, allowRoles("admin"), deleteResource);

export default router;
