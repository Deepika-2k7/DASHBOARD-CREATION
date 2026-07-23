import mongoose, { Document, Schema } from "mongoose";

export interface IResource extends Document {
  title: string;
  fileUrl: string;
  resourceType: "pdf" | "link" | "poll";
  fileName?: string;
  fileType?: string;
  uploadedAt?: Date;
  uploadedBy?: mongoose.Types.ObjectId;
}

const resourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true
    },
    resourceType: {
      type: String,
      enum: ["pdf", "link", "poll"],
      default: "link"
    },
    fileName: {
      type: String,
      trim: true
    },
    fileType: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ resourceType: 1, createdAt: -1 });

export const Resource = mongoose.model<IResource>("Resource", resourceSchema);
