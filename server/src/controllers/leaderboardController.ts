import { Request, Response } from "express";
import { buildLeaderboard } from "../utils/leaderboard.js";

export const getLeaderboard = async (_req: Request, res: Response) => {
  const leaderboard = await buildLeaderboard();
  res.json(leaderboard);
};

