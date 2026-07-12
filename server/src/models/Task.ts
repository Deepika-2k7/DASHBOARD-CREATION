import mongoose, { Document, Schema } from "mongoose";
import { TaskType } from "../types.js";

export interface ITask extends Document {
  title: string;
  description: string;
  date: Date;
  deadline: Date;
  type: TaskType;
  status: "active" | "archived";
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ["daily", "monthly"],
      default: "daily"
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ date: 1, type: 1 }, { unique: true });

export const Task = mongoose.model<ITask>("Task", taskSchema);
