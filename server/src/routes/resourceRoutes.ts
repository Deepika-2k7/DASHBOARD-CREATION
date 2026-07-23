import { NextFunction, Request, Response, Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { createResource, getResources, updateResource, deleteResource } from "../controllers/resourceController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const resourceUploadDir = path.resolve(
  process.cwd(),
  process.env.RESOURCE_UPLOAD_DIR || path.join(process.env.UPLOADS_DIR || "uploads", "resources")
);
fs.mkdirSync(resourceUploadDir, { recursive: true });
const pdfMaxSizeMb = Math.max(100, Number(process.env.RESOURCE_PDF_MAX_SIZE_MB || 100) || 100);

const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, resourceUploadDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    }
  }),
  limits: {
    fileSize: pdfMaxSizeMb * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";

    if (extension !== ".pdf" || !isPdf) {
      cb(new Error("Only PDF files are allowed."));
      return;
    }

    cb(null, true);
  }
});

const router = Router();

const handlePdfUpload = (req: Request, res: Response, next: NextFunction) => {
  pdfUpload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: `PDF files must be ${pdfMaxSizeMb}MB or smaller.` });
      return;
    }

    res.status(400).json({ message: error.message || "Unable to upload PDF." });
  });
};

router.get("/", protect, getResources);
router.post("/", protect, allowRoles("admin"), handlePdfUpload, createResource);
router.put("/:id", protect, allowRoles("admin"), handlePdfUpload, updateResource);
router.delete("/:id", protect, allowRoles("admin"), deleteResource);

export default router;
