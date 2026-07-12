import { Response } from "express";
import { AuthRequest } from "../types.js";
import { Submission } from "../models/Submission.js";
import { Task } from "../models/Task.js";
import { sameDay, startOfDay } from "../utils/dates.js";

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, date, deadline, type, status } = req.body;

  if (!title || !description || !date || !deadline) {
    res.status(400).json({ message: "Please fill in all task details." });
    return;
  }

  const taskDate = startOfDay(date);
  const deadlineDate = new Date(deadline);
  const taskType = type === "monthly" ? "monthly" : "daily";

  if (deadlineDate <= taskDate) {
    res.status(400).json({ message: "Deadline must be later than the task date." });
    return;
  }

  const existingTask = await Task.findOne({ date: taskDate, type: taskType });
  if (existingTask) {
    res.status(409).json({ message: "A task already exists for that date and type." });
    return;
  }

  const task = await Task.create({
    title,
    description,
    date: taskDate,
    deadline: deadlineDate,
    type: taskType,
    status: status === "archived" ? "archived" : "active"
  });

  res.status(201).json(task);
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  const tasks = await Task.find().sort({ date: -1 }).lean();

  if (req.user?.role === "admin") {
    res.json(tasks);
    return;
  }

  const submissions = await Submission.find({ studentId: req.user?.userId }).select("taskId submittedAt status").lean();
  const submittedTaskIds = new Map(submissions.map((item) => [String(item.taskId), item]));
  const now = new Date();

  const decorated = tasks.map((task) => {
    const submission = submittedTaskIds.get(String(task._id));
    const isOpen = now <= new Date(task.deadline);

    return {
      ...task,
      isSubmitted: Boolean(submission),
      submissionStatus: submission ? submission.status : "pending",
      isOpen,
      friendlyLockMessage: isOpen ? null : "Submissions closed for this task window.",
      submittedAt: submission?.submittedAt || null
    };
  });

  res.json(decorated);
};

export const getTodayTask = async (_req: AuthRequest, res: Response) => {
  const today = new Date();
  const tasks = await Task.find({ type: "daily" }).sort({ date: -1 }).lean();
  const task = tasks.find((item) => sameDay(item.date, today));

  if (!task) {
    res.status(404).json({ message: "No task has been posted for today yet." });
    return;
  }

  res.json(task);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, date, deadline, type, status } = req.body;

  const task = await Task.findById(id);
  if (!task) {
    res.status(404).json({ message: "Task not found." });
    return;
  }

  if (title) task.title = title;
  if (description) task.description = description;
  if (date) task.date = startOfDay(date);
  if (deadline) task.deadline = new Date(deadline);
  if (type) task.type = type === "monthly" ? "monthly" : "daily";
  if (status) task.status = status === "archived" ? "archived" : "active";

  await task.save();
  res.json(task);
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    res.status(404).json({ message: "Task not found." });
    return;
  }

  res.json({ message: "Task deleted successfully." });
};
