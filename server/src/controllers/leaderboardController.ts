import { Request, Response } from "express";
import { buildLeaderboard, buildLeaderboardTop } from "../utils/leaderboard.js";

export const getLeaderboard = async (req: Request, res: Response) => {
  const limitParam = Number(req.query.limit);
  const leaderboard = Number.isFinite(limitParam) && limitParam > 0
    ? await buildLeaderboardTop(limitParam)
    : await buildLeaderboard();
  res.json(leaderboard);
};

