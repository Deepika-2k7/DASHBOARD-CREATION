import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    googleId: { type: String, trim: true, sparse: true, unique: true },
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

userSchema.index({ role: 1, username: 1 });
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ googleId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);

export default User;
export { User };
