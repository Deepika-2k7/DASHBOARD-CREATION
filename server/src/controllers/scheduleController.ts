import { Response } from "express";
import { Schedule } from "../models/Schedule.js";
import { AuthRequest } from "../types.js";

export const getSchedule = async (_req: AuthRequest, res: Response) => {
  const schedule = await Schedule.findOne().sort({ updatedAt: -1 }).lean();
  res.json(schedule || { weeklyData: [] });
};

export const saveSchedule = async (req: AuthRequest, res: Response) => {
  const { weeklyData } = req.body as { weeklyData?: { day: string; slots: string[] }[] };

  if (!weeklyData?.length) {
    res.status(400).json({ message: "Weekly schedule data is required." });
    return;
  }

  const schedule = await Schedule.findOneAndUpdate({}, { weeklyData }, { new: true, upsert: true });
  res.json(schedule);
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { weeklyData } = req.body;

  const schedule = await Schedule.findById(id);
  if (!schedule) {
    res.status(404).json({ message: "Schedule not found." });
    return;
  }

  if (weeklyData) schedule.weeklyData = weeklyData;

  await schedule.save();
  res.json(schedule);
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const schedule = await Schedule.findByIdAndDelete(id);
  if (!schedule) {
    res.status(404).json({ message: "Schedule not found." });
    return;
  }

  res.json({ message: "Schedule deleted successfully." });
};
