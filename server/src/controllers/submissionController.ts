import { Response } from "express";
import { AuthRequest, VerificationStatus } from "../types.js";
import { Submission } from "../models/Submission.js";
import { Task } from "../models/Task.js";

export const createSubmission = async (req: AuthRequest, res: Response) => {
  const { taskId, link, message, fileUrl } = req.body;

  if (!taskId) {
    res.status(400).json({ message: "Task is required." });
    return;
  }

  if (!link?.trim() && !message?.trim() && !fileUrl?.trim()) {
    res.status(400).json({ message: "Please provide a link, message, or file." });
    return;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).json({ message: "Task not found." });
    return;
  }

  const now = new Date();
  if (now > new Date(task.deadline)) {
    res.status(400).json({ message: "Submissions closed for this task." });
    return;
  }

  const existing = await Submission.findOne({
    studentId: req.user?.userId,
    taskId
  });

  if (existing) {
    res.status(409).json({ message: "You already submitted this task." });
    return;
  }

  const submission = await Submission.create({
    studentId: req.user?.userId,
    taskId,
    link: link?.trim() || "",
    message: message?.trim() || "",
    fileUrl: fileUrl?.trim() || "",
    submittedAt: now,
    status: "pending"
  });

  res.status(201).json(submission);
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  const query = req.user?.role === "admin" ? {} : { studentId: req.user?.userId };
  const submissions = await Submission.find(query)
    .populate("studentId", "name username registerNumber")
    .populate("taskId", "title date deadline type")
    .sort({ submittedAt: -1 });

  res.json(submissions);
};

export const updateSubmissionStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status?: VerificationStatus };

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ message: "A valid status is required." });
    return;
  }

  const submission = await Submission.findByIdAndUpdate(id, { status }, { new: true })
    .populate("studentId", "name username registerNumber")
    .populate("taskId", "title date deadline type");

  if (!submission) {
    res.status(404).json({ message: "Submission not found." });
    return;
  }

  res.json(submission);
};
