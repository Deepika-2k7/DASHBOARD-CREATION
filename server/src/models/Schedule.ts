import mongoose, { Document, Schema } from "mongoose";

interface ScheduleDay {
  day: string;
  slots: string[];
}

export interface ISchedule extends Document {
  weeklyData: ScheduleDay[];
}

const scheduleSchema = new Schema<ISchedule>(
  {
    weeklyData: {
      type: [
        new Schema<ScheduleDay>(
          {
            day: { type: String, required: true, trim: true },
            slots: { type: [String], default: [] }
          },
          { _id: false }
        )
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
