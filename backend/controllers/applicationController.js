import Application from "../models/application.js";
import Job from "../models/job.js";
import cloudinary from "../config/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";



export const postApplication = async (req, res) => {
  try {
    if (req.user.role === "Employer") {
      return res.status(403).json({
        success: false,
        message: "Employer is not allowed to apply for jobs.",
      });
    }

    const { name, email, coverLetter, phone, address, jobId } = req.body;

    if (!name || !email || !coverLetter || !phone || !address || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    const uploadedFile = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw", // for pdf/doc/docx
          folder: "jobify_resumes",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    const application = await Application.create({
      name,
      email,
      coverLetter,
      phone,
      address,
      applicantID: req.user._id,
      employerID: jobDetails.postedBy,
      jobId,
      resume: {
        public_id: uploadedFile.public_id,
        url: uploadedFile.secure_url,
      },
    });

    // Send confirmation email (non-blocking)
    sendEmail({
      to: email,
      subject: "Application received – Jobify",
      text: `Hi ${name}, we have received your application for "${jobDetails.title}" at ${jobDetails.company}. We will get back to you soon.`,
      html: `<h2>Application received</h2><p>Hi ${name},</p><p>We have received your application for <strong>${jobDetails.title}</strong> at <strong>${jobDetails.company}</strong>.</p><p>We will get back to you soon.</p>`,
    }).catch((err) => console.error("Application confirmation email failed:", err));

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit application.",
    });
  }
};


export const jobseekerGetAllApplications = async (req, res) => {
  try {
    const role = req.user.role;
    if (role === "Employer") {
      throw new Error("Employer not allowed to access this resource.");
    }
    const { _id } = req.user;
    const applications = await Application.find({ applicantID: _id });
    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const jobseekerDeleteApplication = async (req, res) => {
  try {
    if (req.user.role === "Employer") {
      return res.status(403).json({
        success: false,
        message: "Employer not allowed to access this resource.",
      });
    }

    const { id } = req.params;

    const deletedApplication = await Application.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
