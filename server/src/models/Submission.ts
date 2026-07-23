import mongoose, { Document, Schema } from "mongoose";
import { VerificationStatus } from "../types.js";

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  link?: string;
  message?: string;
  fileUrl?: string;
  submittedAt: Date;
  status: VerificationStatus;
}

const submissionSchema = new Schema<ISubmission>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    link: {
      type: String,
      trim: true,
      default: ""
    },
    message: {
      type: String,
      trim: true,
      default: ""
    },
    fileUrl: {
      type: String,
      trim: true,
      default: ""
    },
    submittedAt: {
      type: Date,
      default: Date.now
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

submissionSchema.index({ studentId: 1, taskId: 1 }, { unique: true });
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ studentId: 1, submittedAt: -1 });

export const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);
