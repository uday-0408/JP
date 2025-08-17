import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    console.log("applyJob called");
    console.log("User ID:", userId);
    console.log("Job ID:", jobId);

    if (!jobId) {
      console.warn("Job ID not provided");
      return res.status(400).json({
        message: "Job id is required.",
        success: false,
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    console.log("Existing Application:", existingApplication);

    if (existingApplication) {
      console.warn("Duplicate application attempt");
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }

    const job = await Job.findById(jobId);
    console.log("Job fetched for application:", job);

    if (!job) {
      console.warn("Job not found");
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });
    console.log("New application created:", newApplication);

    job.applications.push(newApplication._id);
    await job.save();
    console.log("Job document updated with new application");

    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error in applyJob:", error);
    return res.status(500).json({
      message: `Internal Server Error from applyJob: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    console.log("getAppliedJobs called by user:", userId);

    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company",
          options: { sort: { createdAt: -1 } },
        },
      });

    console.log(`Found ${application.length} applications`);

    if (!application || application.length === 0) {
      console.warn("No applications found for user:", userId);
      return res.status(404).json({
        message: "No Applications",
        success: false,
      });
    }

    return res.status(200).json({
      application,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAppliedJobs:", error);
    return res.status(500).json({
      message: `Internal Server Error from getAppliedJobs: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("getApplicants called for job ID:", jobId);

    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: { path: "applicant" },
    });

    console.log("Job with applicants:", job);

    if (!job) {
      console.warn("Job not found for ID:", jobId);
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    return res.status(200).json({
      job,
      succees: true,
    });
  } catch (error) {
    console.error("Error in getApplicants:", error);
    return res.status(500).json({
      message: `Internal Server Error from getApplicants: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    console.log("updateStatus called with:", { applicationId, status });

    if (!status) {
      console.warn("Status not provided");
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }

    const application = await Application.findOne({ _id: applicationId });
    console.log("Application fetched for status update:", application);

    if (!application) {
      console.warn("Application not found for ID:", applicationId);
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    application.status = status.toLowerCase();
    await application.save();
    console.log("Application status updated to:", application.status);

    return res.status(200).json({
      message: "Status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error in updateStatus:", error);
    return res.status(500).json({
      message: `Internal Server Error from updateStatus: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};

export const isApplied = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    console.log("isApplied called by user:", userId, "for job:", jobId);

    if (!jobId) {
      console.warn("Job ID not provided");
      return res.status(400).json({
        message: "Job id is required.",
        success: false,
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    console.log("Existing application:", existingApplication);

    if (existingApplication) {
      return res.status(200).json({
        message: "You have already applied for this job.",
        success: true,
        isApplied: true,
      });
    } else {
      return res.status(200).json({
        message: "You have not applied for this job.",
        success: true,
        isApplied: false,
      });
    }
  } catch (error) {
    console.error("Error in isApplied:", error);
    return res.status(500).json({
      message: `Internal Server Error from isApplied: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};
