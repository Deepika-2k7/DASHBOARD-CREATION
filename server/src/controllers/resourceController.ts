import { Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { Resource } from "../models/Resource.js";
import { AuthRequest } from "../types.js";

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeWebUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.href;
  } catch {
    return "";
  }
};

const getBaseUrl = (req: AuthRequest) => `${req.protocol}://${req.get("host")}`;

const normalizeFileUrl = (req: AuthRequest, fileUrl: string) => {
  if (!fileUrl) {
    return "";
  }

  if (isHttpUrl(fileUrl)) {
    return fileUrl;
  }

  const normalizedPath = fileUrl.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${getBaseUrl(req)}/${normalizedPath}`;
};

const isLocalUploadPath = (fileUrl: string) => !isHttpUrl(fileUrl) && fileUrl.startsWith("uploads/");

const deleteLocalUpload = async (fileUrl: string) => {
  if (!isLocalUploadPath(fileUrl)) {
    return;
  }

  const absolutePath = path.resolve(process.cwd(), fileUrl);
  await fs.unlink(absolutePath).catch(() => undefined);
};

const mapResource = (req: AuthRequest, resource: any) => ({
  ...resource,
  fileUrl: normalizeFileUrl(req, resource.fileUrl || ""),
  uploadedAt: resource.uploadedAt || resource.createdAt
});

const validatePdfFile = (file?: Express.Multer.File) => {
  if (!file) {
    return "A PDF file is required.";
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const isPdfMimeType = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";

  if (extension !== ".pdf" || !isPdfMimeType) {
    return "Only PDF files are allowed.";
  }

  return "";
};

export const getResources = async (req: AuthRequest, res: Response) => {
  const resources = await Resource.find().sort({ createdAt: -1 }).lean();
  res.json(resources.map((resource) => mapResource(req, resource)));
};

export const updateResource = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, fileUrl, resourceType } = req.body;
  const uploadedFile = req.file;

  const resource = await Resource.findById(id);
  if (!resource) {
    res.status(404).json({ message: "Resource not found." });
    return;
  }

  if (title?.trim()) resource.title = title.trim();

  if (resourceType === "pdf") {
    if (uploadedFile) {
      const storedFileUrl = path.relative(process.cwd(), uploadedFile.path).replace(/\\/g, "/");
      resource.fileUrl = storedFileUrl;
      resource.fileName = uploadedFile.originalname;
      resource.fileType = uploadedFile.mimetype;
    } else if (resource.resourceType !== "pdf") {
      res.status(400).json({ message: "A PDF file is required." });
      return;
    }
    resource.resourceType = "pdf";
  } else if (resourceType === "poll") {
    const normalizedUrl = normalizeWebUrl(fileUrl || resource.fileUrl || "");
    if (!normalizedUrl) {
      res.status(400).json({ message: "A valid poll URL is required." });
      return;
    }

    resource.fileUrl = normalizedUrl;
    resource.resourceType = "poll";
    resource.fileName = undefined;
    resource.fileType = undefined;
  } else if (resourceType === "link" || fileUrl) {
    const normalizedUrl = normalizeWebUrl(fileUrl || resource.fileUrl || "");
    if (!normalizedUrl) {
      res.status(400).json({ message: "A valid URL is required." });
      return;
    }

    resource.fileUrl = normalizedUrl;
    resource.resourceType = "link";
    resource.fileName = undefined;
    resource.fileType = undefined;
  }

  await resource.save();
  res.json(mapResource(req, resource.toObject()));
};

export const deleteResource = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) {
    res.status(404).json({ message: "Resource not found." });
    return;
  }

  await deleteLocalUpload(resource.fileUrl);
  res.json({ message: "Resource deleted successfully." });
};

export const createResource = async (req: AuthRequest, res: Response) => {
  const { title, resourceType, fileUrl } = req.body;
  const uploadedFile = req.file;

  if (!title?.trim()) {
    res.status(400).json({ message: "Title is required." });
    return;
  }

  if (resourceType === "pdf") {
    const validationError = validatePdfFile(uploadedFile);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const storedFileUrl = uploadedFile
      ? path.relative(process.cwd(), uploadedFile.path).replace(/\\/g, "/")
      : "";
    const resource = await Resource.create({
      title: title.trim(),
      fileUrl: storedFileUrl,
      resourceType: "pdf",
      fileName: uploadedFile?.originalname,
      fileType: uploadedFile?.mimetype,
      uploadedAt: new Date(),
      uploadedBy: req.user?.userId
    });

    res.status(201).json(mapResource(req, resource.toObject()));
    return;
  }

  if (resourceType === "poll") {
    const normalizedUrl = normalizeWebUrl(fileUrl || "");
    if (!normalizedUrl) {
      res.status(400).json({ message: "A poll URL is required." });
      return;
    }

    const resource = await Resource.create({
      title: title.trim(),
      fileUrl: normalizedUrl,
      resourceType: "poll",
      uploadedAt: new Date(),
      uploadedBy: req.user?.userId
    });

    res.status(201).json(mapResource(req, resource.toObject()));
    return;
  }

  const normalizedUrl = normalizeWebUrl(fileUrl || "");
  if (!normalizedUrl) {
    res.status(400).json({ message: "File URL is required." });
    return;
  }

  const resource = await Resource.create({
    title: title.trim(),
    fileUrl: normalizedUrl,
    resourceType: "link",
    uploadedAt: new Date(),
    uploadedBy: req.user?.userId
  });

  res.status(201).json(mapResource(req, resource.toObject()));
};
