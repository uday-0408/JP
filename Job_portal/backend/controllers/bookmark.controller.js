import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";

// Toggle bookmark status (add or remove)
export const toggleBookmark = async (req, res) => {
  console.log("🔍 Toggle bookmark request received");
  console.log("🔍 Request body:", req.body);
  console.log("🔍 Auth cookie:", req.cookies.token ? "Present" : "Missing");
  console.log("🔍 User ID from auth:", req.id);
  
  try {
    const { jobId } = req.body;
    const userId = req.id; // User ID from auth middleware
    
    console.log("🔍 Job ID:", jobId);
    console.log("🔍 User ID:", userId);

    if (!jobId) {
      console.log("❌ Job ID is missing");
      return res.status(400).json({ message: "Job ID is required", success: false });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    console.log("🔍 Job found:", job ? "Yes" : "No");
    if (!job) {
      console.log("❌ Job not found with ID:", jobId);
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // Check if user has already bookmarked this job
    const user = await User.findById(userId);
    console.log("🔍 User found:", user ? "Yes" : "No");
    if (!user) {
      console.log("❌ User not found with ID:", userId);
      return res.status(404).json({ message: "User not found", success: false });
    }
    
    console.log("🔍 User bookmarked jobs:", user.bookmarkedJobs || []);
    
    // Safely check if job is bookmarked
    let isBookmarked = false;
    
    if (user.bookmarkedJobs && Array.isArray(user.bookmarkedJobs) && user.bookmarkedJobs.length > 0) {
      isBookmarked = user.bookmarkedJobs.some(bookmark => 
        bookmark && bookmark.job && bookmark.job.toString() === jobId
      );
    }
    
    console.log("🔍 Is job already bookmarked:", isBookmarked);

    if (isBookmarked) {
      // Remove bookmark by mutating document and saving
      console.log("🔄 Removing bookmark (document save)");
      user.bookmarkedJobs = user.bookmarkedJobs.filter(b => b.job.toString() !== jobId);
      await user.save();
      job.bookmarkedBy = job.bookmarkedBy.filter(b => b.user.toString() !== userId);
      await job.save();
      return res.status(200).json({ message: "Job removed from bookmarks", success: true, isBookmarked: false });
    } else {
      // Add bookmark by mutating document and saving
      console.log("🔄 Adding bookmark (document save)");
      // Ensure arrays exist
      if (!Array.isArray(user.bookmarkedJobs)) user.bookmarkedJobs = [];
      if (!Array.isArray(job.bookmarkedBy)) job.bookmarkedBy = [];
      // Push new bookmark entries
      user.bookmarkedJobs.push({ job: jobId, bookmarkedAt: new Date() });
      await user.save();
      job.bookmarkedBy.push({ user: userId, bookmarkedAt: new Date() });
      await job.save();
      return res.status(200).json({ message: "Job added to bookmarks", success: true, isBookmarked: true });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get all bookmarked jobs for the current user
export const getBookmarkedJobs = async (req, res) => {
  try {
    const userId = req.id; // User ID from auth middleware

    const user = await User.findById(userId)
      .populate({
        path: 'bookmarkedJobs.job',
        select: 'title company location salary jobType description position createdAt',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Format the response
    const bookmarkedJobs = user.bookmarkedJobs.map(bookmark => {
      return {
        ...bookmark.job.toObject(),
        bookmarkedAt: bookmark.bookmarkedAt
      };
    });

    return res.status(200).json({ 
      message: "Bookmarked jobs fetched successfully", 
      success: true, 
      bookmarkedJobs 
    });
  } catch (error) {
    console.error("Error fetching bookmarked jobs:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Check if a job is bookmarked by the current user
export const isJobBookmarked = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.id; // User ID from auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const isBookmarked = user.bookmarkedJobs.some(bookmark => bookmark.job.toString() === jobId);
    
    return res.status(200).json({ 
      success: true, 
      isBookmarked 
    });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
