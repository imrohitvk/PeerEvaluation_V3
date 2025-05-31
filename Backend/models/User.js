import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'ta', 'student'],
    default: 'student'
  },
  resetToken: {
    type: String,
    default: null
  },
  tokenExpiry: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
