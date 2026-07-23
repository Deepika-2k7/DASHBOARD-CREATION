import mongoose, { Document, Schema } from "mongoose";

export interface ITaskCompletion extends Document {
  taskId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  completedAt: Date;
}

const taskCompletionSchema = new Schema<ITaskCompletion>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

taskCompletionSchema.index({ taskId: 1, studentId: 1 }, { unique: true });
taskCompletionSchema.index({ studentId: 1, completedAt: -1 });

export const TaskCompletion = mongoose.model<ITaskCompletion>("TaskCompletion", taskCompletionSchema);
