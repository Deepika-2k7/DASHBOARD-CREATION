import { Request } from "express";

export type Role = "admin" | "student";
export type TaskType = "daily" | "monthly";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type LeaveType = "leave" | "od";

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  files?: any[] | { [fieldname: string]: any[] };
  file?: Express.Multer.File;
}
