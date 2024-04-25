import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import cloudinary from "cloudinary";
import { Job } from "../models/jobSchema.js";

export const employerGetAllApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler(
          "Job seeker is not allowed to access this resources!",
          400
        )
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobSeekerGetAllApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to access this resources!",
          400
        )
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

//jobseeker delete application only not employer

export const jobSeekerDeleteApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to access this resources!",
          400
        )
      );
    }
    const { id } = req.params;
    const applications = await Application.findById(id);
    if (!applications) {
      return next(new ErrorHandler("Oops,application not found!", 404));
    }
    await applications.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted Successfully",
    });
  }
);

//post application by job Seeker
export const postApplication = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer is not allowed to access this resources!", 400)
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required"));
  }
  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler(
        "Invalid file type.Please upload your resume in a PNG,JPG OR WEBP format",
        400
      )
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.log(
      "cloudinary Error:",
      cloudinaryResponse.error || "Unknown cloudinary error"
    );
  }
  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found", 404));
  }

  const employID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employID ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all field", 400));
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employID,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});
