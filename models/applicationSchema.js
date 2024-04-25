import mongoose from "mongoose";
import validator from "validator";

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name!"],
    minLength: [3, "Name must contain at least 3 character"],
    maxLength: [30, "Name cannot exceed 30 character"],
  },
  email: {
    type: String,
    validator: [validator.isEmail, "Please provide a valid email"],
    required: [true, "Please provide your email"],
  },
  coverLetter: {
    type: String,
    required: [true, "Please provide your cover Letter"],
  },
  phone: {
    type: Number,
    required: [true, "Please provide your Phone Number "],
  },
  address: {
    type: String,
    required: [true, "Please provide your Address"],
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  applicantID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Job Seeker"],
      required: true,
    },
  },
  employID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Employer"],
      required: true,
    },
  },
});
export const Application = mongoose.model("Application", applicationSchema);
