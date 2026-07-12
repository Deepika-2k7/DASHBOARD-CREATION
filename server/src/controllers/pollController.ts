import { Response } from "express";
import { Poll } from "../models/Poll.js";
import { AuthRequest } from "../types.js";

export const getPolls = async (_req: AuthRequest, res: Response) => {
  const polls = await Poll.find().sort({ createdAt: -1 }).lean();
  res.json(polls);
};

export const createPoll = async (req: AuthRequest, res: Response) => {
  const { question, options } = req.body as { question?: string; options?: string[] };

  if (!question?.trim() || !options?.length) {
    res.status(400).json({ message: "Question and options are required." });
    return;
  }

  const poll = await Poll.create({
    question: question.trim(),
    options: options.filter(Boolean).map((text) => ({ text: text.trim(), votes: 0 })),
    responses: []
  });

  res.status(201).json(poll);
};

export const submitPollResponse = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { optionIndex } = req.body as { optionIndex?: number };

  if (typeof optionIndex !== "number") {
    res.status(400).json({ message: "Option index is required." });
    return;
  }

  const poll = await Poll.findById(id);
  if (!poll) {
    res.status(404).json({ message: "Poll not found." });
    return;
  }

  if (poll.responses.some((response) => String(response.studentId) === req.user?.userId)) {
    res.status(409).json({ message: "You already responded to this poll." });
    return;
  }

  if (!poll.options[optionIndex]) {
    res.status(400).json({ message: "Invalid option selected." });
    return;
  }

  poll.options[optionIndex].votes += 1;
  poll.responses.push({
    studentId: req.user?.userId as any,
    optionIndex
  });

  await poll.save();
  res.json(poll);
};

export const updatePoll = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { question, options } = req.body;

  const poll = await Poll.findById(id);
  if (!poll) {
    res.status(404).json({ message: "Poll not found." });
    return;
  }

  if (question) poll.question = question;
  if (options) poll.options = options.map((opt: any) => ({ text: opt.text, votes: opt.votes || 0 }));

  await poll.save();
  res.json(poll);
};

export const deletePoll = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const poll = await Poll.findByIdAndDelete(id);
  if (!poll) {
    res.status(404).json({ message: "Poll not found." });
    return;
  }

  res.json({ message: "Poll deleted successfully." });
};
