import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtTokens.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, role, password } = req.body;
  if (!name || !email || !phone || !role || !password) {
    return next(new ErrorHandler("Please fill full registration form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already exist!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    role,
    password,
  });
  sendToken(user, 200, res, "User registered Successfully");
});

//LOGIN

export const login = catchAsyncError(async (req, res, next) => {
  const { email, role, password } = req.body;
  if (!email || !role || !password) {
    return next(
      new ErrorHandler("Please provide email,password and role.", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 400));
  }
  if (user.role !== role) {
    return next(new ErrorHandler("User with this role not found!", 400));
  }
  sendToken(user, 200, res, "User logged in  Successfully");
});

//LOGOUT
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({ success: true, message: "User logged out successfully!" });
});

//get users

export const getUser = catchAsyncError((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
