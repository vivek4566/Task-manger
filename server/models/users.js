import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Editor', 'Viewer', 'Admin'],
    default: 'Viewer'
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default ( mongoose.model('User', userSchema)); 