import mongoose, { Document, Schema } from "mongoose";

export interface IResource extends Document {
  title: string;
  fileUrl: string;
  resourceType: "pdf" | "link";
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
      enum: ["pdf", "link"],
      default: "link"
    }
  },
  {
    timestamps: true
  }
);

export const Resource = mongoose.model<IResource>("Resource", resourceSchema);
