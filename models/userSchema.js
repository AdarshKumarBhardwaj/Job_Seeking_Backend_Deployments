import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Name must contains at least 3 character"],
    maxLength: [30, "Name cannot exceed 30 character"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: Number,
    required: [true, "Please provide your phone number"],
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minLength: [8, "Password must contains at least 8 character"],
    maxLength: [32, "Password cannot exceed 32 character"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "Please provide your role"],
    enum: ["Job Seeker", "Employer"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//HASHING THE PASSWORD
//this operation is perform when schemas updated or new password  comes
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 10);
});

//COMPARING PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

//GENERATING A JWT TOKEN FOR AUTHORIZATION
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const User = mongoose.model("User", userSchema);
