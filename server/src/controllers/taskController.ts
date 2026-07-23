import { Response } from "express";
import { AuthRequest } from "../types.js";
import { Submission } from "../models/Submission.js";
import { Task } from "../models/Task.js";
import { TaskCompletion } from "../models/TaskCompletion.js";
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
    const completions = await TaskCompletion.find().populate("studentId", "username").lean();
    const completionsByTask = new Map<
      string,
      { completedCount: number; completedStudents: string[] }
    >();

    for (const completion of completions) {
      const taskId = String(completion.taskId);
      const bucket =
        completionsByTask.get(taskId) || { completedCount: 0, completedStudents: [] };
      bucket.completedCount += 1;
      const username = (completion.studentId as any)?.username;
      if (username) {
        bucket.completedStudents.push(username);
      }
      completionsByTask.set(taskId, bucket);
    }

    res.json(
      tasks.map((task) => {
        const stats = completionsByTask.get(String(task._id)) || {
          completedCount: 0,
          completedStudents: []
        };

        return {
          ...task,
          completedCount: stats.completedCount,
          completedStudents: stats.completedStudents
        };
      })
    );
    return;
  }

  const completions = await TaskCompletion.find({ studentId: req.user?.userId })
    .select("taskId completedAt")
    .lean();
  const completedTaskIds = new Map(completions.map((item) => [String(item.taskId), item]));
  const now = new Date();

  const decorated = tasks.map((task) => {
    const completion = completedTaskIds.get(String(task._id));
    const isOpen = now <= new Date(task.deadline);

    return {
      ...task,
      completionStatus: completion ? "completed" : "pending",
      completedAt: completion?.completedAt || null,
      isOpen,
      friendlyLockMessage: isOpen ? null : "Task window is closed."
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

  await TaskCompletion.deleteMany({ taskId: id });
  res.json({ message: "Task deleted successfully." });
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.role !== "student") {
    res.status(403).json({ message: "Only students can complete tasks." });
    return;
  }

  const task = await Task.findById(id);
  if (!task) {
    res.status(404).json({ message: "Task not found." });
    return;
  }

  const existingCompletion = await TaskCompletion.findOne({
    taskId: id,
    studentId: req.user.userId
  });

  if (existingCompletion) {
    res.status(409).json({ message: "This task has already been marked completed." });
    return;
  }

  const completion = await TaskCompletion.create({
    taskId: id,
    studentId: req.user.userId,
    completedAt: new Date()
  });

  res.status(201).json({
    message: "Task marked as completed.",
    completion
  });
};
