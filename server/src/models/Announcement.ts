import mongoose, { Document, Schema } from "mongoose";

interface AnnouncementReply {
  userId: mongoose.Types.ObjectId;
  username: string;
  message: string;
  createdAt: Date;
}

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  replies: AnnouncementReply[];
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const replySchema = new Schema<AnnouncementReply>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    replies: {
      type: [replySchema],
      default: []
    },
    readBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    }
  },
  {
    timestamps: true
  }
);

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ readBy: 1 });

export const Announcement = mongoose.model<IAnnouncement>("Announcement", announcementSchema);
