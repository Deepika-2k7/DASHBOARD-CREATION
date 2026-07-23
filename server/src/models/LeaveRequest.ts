import mongoose, { Document, Schema } from "mongoose";
import { LeaveType, VerificationStatus } from "../types.js";

export interface ILeaveRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  date: Date;
  reason: string;
  type: LeaveType;
  status: VerificationStatus;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["leave", "od"],
      default: "leave"
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

leaveRequestSchema.index({ studentId: 1, createdAt: -1 });
leaveRequestSchema.index({ createdAt: -1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);
