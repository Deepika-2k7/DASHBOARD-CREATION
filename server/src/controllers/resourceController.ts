import { Response } from "express";
import { Resource } from "../models/Resource.js";
import { AuthRequest } from "../types.js";

export const getResources = async (req: AuthRequest, res: Response) => {
  const resources = await Resource.find().sort({ createdAt: -1 }).lean();
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const normalized = resources.map((resource) => {
    const fileUrl = resource.fileUrl || "";
    const normalizedUrl =
      resource.resourceType === "pdf" && !fileUrl.startsWith("http")
        ? `${baseUrl}/${fileUrl.replace(/\\/g, "/")}`
        : fileUrl;

    return {
      ...resource,
      fileUrl: normalizedUrl
    };
  });

  res.json(normalized);
};
export const updateResource = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, fileUrl, resourceType } = req.body;

  const resource = await Resource.findById(id);
  if (!resource) {
    res.status(404).json({ message: "Resource not found." });
    return;
  }

  if (title) resource.title = title;
  if (fileUrl) resource.fileUrl = fileUrl;
  if (resourceType) resource.resourceType = resourceType;

  await resource.save();
  res.json(resource);
};

export const deleteResource = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) {
    res.status(404).json({ message: "Resource not found." });
    return;
  }

  res.json({ message: "Resource deleted successfully." });
};
export const createResource = async (req: AuthRequest, res: Response) => {
  const { title, resourceType, fileUrl } = req.body;

  if (!title) {
    res.status(400).json({ message: "Title is required." });
    return;
  }

  if (resourceType === "pdf") {
    if (!req.files || (req.files as any[]).length === 0) {
      res.status(400).json({ message: "At least one PDF file is required." });
      return;
    }

    const resources = [];
    for (const file of req.files as any[]) {
      const resource = await Resource.create({
        title,
        fileUrl: file.path,
        resourceType: "pdf"
      });
      resources.push(resource);
    }

    res.status(201).json(resources);
  } else {
    if (!fileUrl) {
      res.status(400).json({ message: "File URL is required." });
      return;
    }

    const resource = await Resource.create({
      title,
      fileUrl,
      resourceType: "link"
    });

    res.status(201).json(resource);
  }
};
