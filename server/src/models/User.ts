import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    username: { type: String, required: true, unique: true, trim: true },
    registerNumber: { type: String, default: "", trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" }
  },
  {
    collection: "users",
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;
export { User };
