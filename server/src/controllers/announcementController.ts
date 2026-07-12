import { Response } from "express";
import { Announcement } from "../models/Announcement.js";
import User from "../models/User.js";
import { AuthRequest } from "../types.js";

export const getAnnouncements = async (_req: AuthRequest, res: Response) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
  res.json(announcements);
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  const { title, message } = req.body;

  if (!title || !message) {
    res.status(400).json({ message: "Title and message are required." });
    return;
  }

  const announcement = await Announcement.create({ title, message });
  res.status(201).json(announcement);
};

export const replyToAnnouncement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message?.trim()) {
    res.status(400).json({ message: "Reply message is required." });
    return;
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    res.status(404).json({ message: "Announcement not found." });
    return;
  }

  const user = await User.findById(req.user?.userId).select("username");
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  announcement.replies.push({
    userId: req.user?.userId as any,
    username: user.username,
    message: message.trim(),
    createdAt: new Date()
  });

  await announcement.save();
  res.json(announcement);
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, message } = req.body;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    res.status(404).json({ message: "Announcement not found." });
    return;
  }

  if (title) announcement.title = title;
  if (message) announcement.message = message;

  await announcement.save();
  res.json(announcement);
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    res.status(404).json({ message: "Announcement not found." });
    return;
  }

  res.json({ message: "Announcement deleted successfully." });
};
