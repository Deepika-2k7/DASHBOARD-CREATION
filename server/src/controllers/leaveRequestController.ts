import { Response } from "express";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { AuthRequest, VerificationStatus } from "../types.js";

export const getLeaveRequests = async (req: AuthRequest, res: Response) => {
  const query = req.user?.role === "admin" ? {} : { studentId: req.user?.userId };
  const requests = await LeaveRequest.find(query)
    .populate("studentId", "name username")
    .sort({ createdAt: -1 })
    .lean();

  res.json(requests);
};

export const createLeaveRequest = async (req: AuthRequest, res: Response) => {
  const { date, reason, type } = req.body;

  if (!date || !reason || !type) {
    res.status(400).json({ message: "Date, reason, and type are required." });
    return;
  }

  const request = await LeaveRequest.create({
    studentId: req.user?.userId,
    date,
    reason,
    type
  });

  res.status(201).json(request);
};

export const updateLeaveRequestStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status?: VerificationStatus };

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ message: "A valid status is required." });
    return;
  }

  const request = await LeaveRequest.findByIdAndUpdate(id, { status }, { new: true })
    .populate("studentId", "name username");

  if (!request) {
    res.status(404).json({ message: "Request not found." });
    return;
  }

  res.json(request);
};

export const updateLeaveRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { date, reason, type } = req.body;

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    res.status(404).json({ message: "Leave request not found." });
    return;
  }

  if (date) leaveRequest.date = new Date(date);
  if (reason) leaveRequest.reason = reason;
  if (type) leaveRequest.type = type;

  await leaveRequest.save();
  res.json(leaveRequest);
};

export const deleteLeaveRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const leaveRequest = await LeaveRequest.findByIdAndDelete(id);
  if (!leaveRequest) {
    res.status(404).json({ message: "Leave request not found." });
    return;
  }

  res.json({ message: "Leave request deleted successfully." });
};
