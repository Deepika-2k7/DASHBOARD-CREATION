import mongoose, { Document, Schema } from "mongoose";

interface PollOption {
  text: string;
  votes: number;
}

interface PollResponse {
  studentId: mongoose.Types.ObjectId;
  optionIndex: number;
}

export interface IPoll extends Document {
  question: string;
  options: PollOption[];
  responses: PollResponse[];
}

const pollSchema = new Schema<IPoll>(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [
        new Schema<PollOption>(
          {
            text: { type: String, required: true, trim: true },
            votes: { type: Number, default: 0 }
          },
          { _id: false }
        )
      ],
      default: []
    },
    responses: {
      type: [
        new Schema<PollResponse>(
          {
            studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            optionIndex: { type: Number, required: true }
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

export const Poll = mongoose.model<IPoll>("Poll", pollSchema);
