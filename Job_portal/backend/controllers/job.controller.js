import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import axios from "axios";

export const postJob = async (req, res) => {
  try {
    console.log("postJob called");
    console.log("Request body:", req.body);
    console.log("Request user ID:", req.id);

    const {
      title,
      description,
      salary,
      location,
      jobType,
      requirements,
      experience,
      position,
      companyId,
    } = req.body;

    const userId = req.id;

    if (
      !title ||
      !description ||
      !salary ||
      !location ||
      !jobType ||
      !position ||
      !companyId
    ) {
      console.warn("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Creating job with data:", {
      title,
      description,
      salary,
      location,
      jobType,
      experience,
      requirements,
      position,
      companyId,
      createdBy: userId,
    });

    const job = await Job.create({
      title,
      description,
      salary,
      location,
      jobType,
      experienceLevel: experience,
      requirements: requirements.split(",") || [],
      position,
      company: companyId,
      createdBy: userId,
    });

    console.log("Job created successfully:", job);

    return res.status(201).json({
      message: "new Job posted successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Internal server error from postJob" });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    console.log("[getAllJobs] Function started");
    const keyword = req.query.keyword || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    
    console.log("[getAllJobs] Keyword:", keyword, "Page:", page, "Limit:", limit);

    // Parse filter parameters from keyword if it's in the format "Location: X | Industry: Y | Salary: Z"
    let location = "NA";
    let industry = "NA";
    let salary = "NA";
    let searchQuery = keyword;
    
    // Check if the keyword contains filter parameters
    if (keyword && keyword.includes("|")) {
      try {
        console.log("[getAllJobs] Parsing filter parameters from keyword");
        const parts = keyword.split(" | ");
        parts.forEach((part) => {
          if (part.startsWith("Location:"))
            location = part.split("Location:")[1].trim();
          if (part.startsWith("Industry:"))
            industry = part.split("Industry:")[1].trim();
          if (part.startsWith("Salary:"))
            salary = part.split("Salary:")[1].trim();
        });
        
        // If all filters are "NA", then we're not really filtering
        if (location === "NA" && industry === "NA" && salary === "NA") {
          searchQuery = ""; // No specific filter, get all jobs
        }
        
        console.log(`[getAllJobs] Parsed filters - Location: ${location}, Industry: ${industry}, Salary: ${salary}`);
      } catch (err) {
        console.error("[getAllJobs] Error parsing filters:", err);
        // Continue with the original keyword if parsing fails
      }
    }

    // Build the query
    const query = {
      // Only include regular jobs (those without djangoJobId)
      djangoJobId: { $exists: false }
    };
    
    // Add text search if a plain keyword is provided
    if (keyword && !keyword.includes("|")) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }
    
    // Apply location filter if specified
    if (location !== "NA") {
      query.location = { $regex: location, $options: "i" };
    }
    
    // Apply industry filter (search in title) if specified
    if (industry !== "NA") {
      query.title = { $regex: industry, $options: "i" };
    }
    
    // Apply salary filter if specified
    if (salary !== "NA") {
      // Parse salary range
      try {
        const [min, max] = salary.includes("to")
          ? salary.replace(/[^0-9 to]/g, "").split("to").map(s => parseInt(s.trim()) * 12)
          : salary.split("-").map(s => parseInt(s.replace(/\D/g, "")) * 12);
        
        if (!isNaN(min) && !isNaN(max)) {
          query.salary = { $gte: min, $lte: max };
        }
      } catch (err) {
        console.error("[getAllJobs] Error parsing salary range:", err);
      }
    }

    console.log("[getAllJobs] Query for fetching jobs:", JSON.stringify(query));

    // Count total matching jobs for pagination info
    const totalJobs = await Job.countDocuments(query);
    console.log(`[getAllJobs] Found ${totalJobs} total matching jobs`);

    // Get paginated results
    const jobs = await Job.find(query)
      .populate({ path: "company" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`[getAllJobs] Query returned ${jobs?.length || 0} jobs for page ${page} (${totalJobs} total matches)`);
    
    if (!jobs || jobs.length === 0) {
      console.warn("[getAllJobs] No jobs found matching the criteria");
      // Instead of returning 404, return empty array with success true
      return res.status(200).json({
        jobs: [],
        totalJobs: 0,
        page,
        pageSize: limit,
        totalPages: 0,
        success: true,
        source: "mongodb",
        message: "No jobs found matching your criteria."
      });
    }

    return res.status(200).json({
      jobs,
      totalJobs,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalJobs / limit),
      success: true,
      source: "mongodb"
    });
  } catch (error) {
    console.error("[getAllJobs] Error fetching jobs:", error);
    console.error("[getAllJobs] Error stack:", error.stack);
    return res.status(500).json({
      message: `Internal Server Error from getAllJobs: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};
export const getDjangoJobs=async(req,res)=>{
  try {
    console.log(`[getDjangoJobs] Function started at ${new Date().toISOString()}`);
    console.log(`[getDjangoJobs] Query parameters:`, req.query);
    
    const page_no = parseInt(req.query.page_no) || 1;
    const page_size = parseInt(req.query.page_size) || 6;
    
    console.log(`[getDjangoJobs] Processing Django jobs request - page: ${page_no}, size: ${page_size}`);
    
    // Calculate skip and limit values for pagination
    const skip = (page_no - 1) * page_size;
    const limit = page_size;
    
    // First, check how many Django-sourced jobs we already have in our database
    console.log(`[getDjangoJobs] Checking for existing Django jobs in MongoDB...`);
    const totalStoredDjangoJobs = await Job.countDocuments({ djangoJobId: { $exists: true, $ne: null } });
    console.log(`[getDjangoJobs] Total Django-sourced jobs in MongoDB: ${totalStoredDjangoJobs}`);
    
    // Check if we have enough jobs in the database to satisfy this request
    const requiredJobsCount = skip + limit;
    console.log(`[getDjangoJobs] Required jobs count for this request: ${requiredJobsCount} (skip: ${skip}, limit: ${limit})`);
    
    if (totalStoredDjangoJobs >= requiredJobsCount) {
      console.log(`[getDjangoJobs] Using existing jobs from MongoDB (have ${totalStoredDjangoJobs}, need ${requiredJobsCount})`);
      
      // Get jobs from our database
      console.log(`[getDjangoJobs] Fetching jobs from MongoDB with skip=${skip}, limit=${limit}`);
      const query = { djangoJobId: { $exists: true, $ne: null } };
      console.log(`[getDjangoJobs] MongoDB query:`, JSON.stringify(query));
      
      const jobsFromDB = await Job.find(query)
        .sort({ djangoJobId: 1 }) // Sort by djangoJobId to maintain order
        .skip(skip)
        .limit(limit)
        .populate('company');
      
      console.log(`[getDjangoJobs] MongoDB query complete, found ${jobsFromDB.length} jobs`);
      
      // Calculate total pages, making sure we have at least enough for the current page
      // and potentially one more if we have a full page of results
      const calculatedTotalPages = Math.ceil(totalStoredDjangoJobs / page_size);
      const minRequiredPages = jobsFromDB.length === page_size ? page_no + 1 : page_no;
      const totalPages = Math.max(calculatedTotalPages, minRequiredPages);
      
      console.log(`[getDjangoJobs] Returning ${jobsFromDB.length} jobs from MongoDB (page ${page_no} of ${totalPages})`);
      console.log(`[getDjangoJobs] Response data preview:`, {
        jobCount: jobsFromDB.length,
        firstJobTitle: jobsFromDB.length > 0 ? jobsFromDB[0].title : 'none',
        totalJobs: totalStoredDjangoJobs,
        calculatedTotalPages,
        adjustedTotalPages: totalPages
      });
      
      return res.status(200).json({
        jobs: jobsFromDB,
        totalJobs: totalStoredDjangoJobs,
        totalPages: totalPages,
        page: page_no,
        pageSize: page_size,
        success: true,
        source: "mongodb"
      });
    }
    
    // Calculate what page in the external API corresponds to our requested data
    // This is crucial for correct pagination when fetching from the API
    
    // Check if we need to fetch from the API at a different offset
    // Calculate what API page we need based on how many jobs we already have
    let apiPageNo = 1;
    let apiSkip = 0;
    
    if (totalStoredDjangoJobs > 0) {
      // Calculate how many new jobs we need to fetch
      const jobsNeeded = requiredJobsCount - totalStoredDjangoJobs;
      
      if (jobsNeeded <= 0) {
        // We should have enough jobs but the query didn't return them - let's try to fetch them
        apiPageNo = Math.floor(totalStoredDjangoJobs / page_size) + 1;
        apiSkip = 0; // Start fetching from the next batch
      } else {
        // We need more jobs from the API
        apiPageNo = Math.floor(totalStoredDjangoJobs / page_size) + 1;
        apiSkip = totalStoredDjangoJobs % page_size;
      }
    }
    
    console.log(`[getDjangoJobs] Need to fetch more jobs from Django API (have ${totalStoredDjangoJobs}, need ${requiredJobsCount})`);
    console.log(`[getDjangoJobs] Calculated API page_no: ${apiPageNo}, with skip offset: ${apiSkip}`);
    
    // If we don't have enough jobs, fetch from Django API
    const djangoEndPoint = process.env.DJANGO_END_POINT;
    console.log(`[getDjangoJobs] Django API endpoint: ${djangoEndPoint}`);
    console.log(`[getDjangoJobs] Making API request to ${djangoEndPoint}/paginated_jobs/ with params:`, {
      page_no: apiPageNo, 
      page_size: page_size + apiSkip // Request extra jobs to account for the offset
    });
    
    let response;
    let djangoJobs = [];
    
    try {
      response = await axios.post(`${djangoEndPoint}/paginated_jobs/`,{
        page_no: apiPageNo,
        page_size: page_size + apiSkip
      });
      
      console.log(`[getDjangoJobs] API response status: ${response.status}`);
      console.log(`[getDjangoJobs] API response structure:`, Object.keys(response.data));
      
      // Apply the offset to the returned jobs if needed
      let allReturnedJobs = response.data.jobs || [];
      djangoJobs = apiSkip > 0 && allReturnedJobs.length > apiSkip 
        ? allReturnedJobs.slice(apiSkip) 
        : allReturnedJobs;
      
      console.log(`[getDjangoJobs] Received ${allReturnedJobs.length} total jobs, using ${djangoJobs.length} after offset`);
      
      if (djangoJobs.length === 0) {
        console.log(`[getDjangoJobs] No jobs received from Django API, returning empty results`);
        return res.status(200).json({
          jobs: [],
          totalJobs: totalStoredDjangoJobs,
          totalPages: Math.ceil(totalStoredDjangoJobs / page_size),
          page: page_no,
          pageSize: page_size,
          success: true,
          source: "api-empty"
        });
      }
    } catch (apiError) {
      console.error(`[getDjangoJobs] Error fetching from Django API:`, apiError.message);
      console.log(`[getDjangoJobs] Falling back to MongoDB only results`);
      
      // Try to get whatever we have from MongoDB
      const fallbackJobs = await Job.find({ djangoJobId: { $exists: true, $ne: null } })
        .sort({ djangoJobId: 1 })
        .skip(skip)
        .limit(limit)
        .populate('company');
        
      return res.status(200).json({
        jobs: fallbackJobs,
        totalJobs: totalStoredDjangoJobs,
        totalPages: Math.ceil(totalStoredDjangoJobs / page_size),
        page: page_no,
        pageSize: page_size,
        success: true,
        source: "api-error-fallback"
      });
    }
    
    console.log(`[getDjangoJobs] Processing ${djangoJobs.length} jobs from Django API`);
    
    // Store jobs in MongoDB and track saved jobs
    const savedJobs = [];
    console.log(`[getDjangoJobs] Starting to process and save Django jobs to MongoDB`);
    
    // Find or create a default user for job creation (admin or system user)
    console.log(`[getDjangoJobs] Looking for admin user to associate with jobs`);
    let defaultUser = await User.findOne({ role: "admin" });
    
    // If no admin user found, try to find any user or throw an error
    if (!defaultUser) {
      console.log(`[getDjangoJobs] No admin user found, trying to find any user`);
      defaultUser = await User.findOne();
      if (!defaultUser) {
        console.error(`[getDjangoJobs] No users found in the system at all!`);
        throw new Error("No users found in the system. Cannot create company without a valid user reference.");
      }
      console.log(`[getDjangoJobs] No admin user found, using user: ${defaultUser._id} as fallback`);
    } else {
      console.log(`[getDjangoJobs] Using admin user: ${defaultUser._id} for company creation`);
    }
    
    console.log(`[getDjangoJobs] Starting to process ${djangoJobs.length} jobs from Django API`);
    let newJobsCreated = 0;
    let existingJobsFound = 0;
    
    for (const djangoJob of djangoJobs) {
      console.log(`[getDjangoJobs] Processing job: ${djangoJob.title} (Django ID: ${djangoJob.id})`);
      
      // Check if job already exists by title and django id
      console.log(`[getDjangoJobs] Checking if job already exists in MongoDB`);
      let existingJob = await Job.findOne({ 
        title: djangoJob.title,
        djangoJobId: djangoJob.id
      });
      
      if (!existingJob) {
        console.log(`[getDjangoJobs] Job doesn't exist, creating new record`);
        newJobsCreated++;
        
        // Find or create company
        console.log(`[getDjangoJobs] Looking for company: ${djangoJob.company}`);
        let company = await Company.findOne({ name: djangoJob.company });
        if (!company) {
          console.log(`[getDjangoJobs] Company doesn't exist, creating new company record`);
          company = await Company.create({
            name: djangoJob.company,
            description: `Company imported from Django: ${djangoJob.company}`,
            location: djangoJob.location || "Not specified",
            website: "",
            // Removed foundedYear as it's not in the schema
            userId: defaultUser._id  // Changed from createdBy to userId to match Company schema
          });
          console.log(`[getDjangoJobs] Created new company: ${company.name} with ID: ${company._id}`);
        } else {
          console.log(`[getDjangoJobs] Using existing company: ${company.name} with ID: ${company._id}`);
        }
        
        // Extract requirements from description (basic implementation)
        const requirements = [];
        if (djangoJob.description) {
          // Simple extraction - look for bullet points or lines with specific keywords
          const lines = djangoJob.description.split('\n');
          for (const line of lines) {
            if (line.includes('require') || line.includes('skill') || line.includes('experience') || 
                line.trim().startsWith('-') || line.trim().startsWith('•')) {
              requirements.push(line.trim());
            }
          }
          // Limit to 5 requirements if too many found
          if (requirements.length > 5) requirements.length = 5;
        }
        
        // Create new job
        const newJob = await Job.create({
          title: djangoJob.title,
          description: djangoJob.description,
          location: djangoJob.location || "Remote",
          djangoJobId: djangoJob.id,
          jobType: "Full-time", // Default or extract from description
          salary: 0, // Default or extract from description
          experienceLevel: 1, // Default
          requirements: requirements.length > 0 ? requirements : ["Not specified"],
          position: 1, // Default
          company: company._id,
          createdBy: defaultUser._id
        });
        
        // Add to saved jobs list
        const populatedJob = await Job.findById(newJob._id).populate("company");
        savedJobs.push(populatedJob);
        console.log(`[getDjangoJobs] Saved new job: ${djangoJob.title} with MongoDB ID: ${newJob._id}`);
      } else {
        // Add existing job to the list
        existingJobsFound++;
        const populatedJob = await Job.findById(existingJob._id).populate("company");
        savedJobs.push(populatedJob);
        console.log(`[getDjangoJobs] Using existing job: ${djangoJob.title} with MongoDB ID: ${existingJob._id}`);
      }
    }
    
    // Calculate total pages based on response data or provide a default
    console.log(`[getDjangoJobs] Job processing complete. Created ${newJobsCreated} new jobs, found ${existingJobsFound} existing jobs`);
    console.log(`[getDjangoJobs] Total jobs saved in this batch: ${savedJobs.length}`);
    
    // Get the total job count and calculate total pages
    // Use the API's total_count if available, otherwise default to what we have + what we know exists
    const totalJobsFromAPI = response.data.total_count !== undefined ? response.data.total_count : null;
    const totalJobsEstimate = totalJobsFromAPI !== null ? totalJobsFromAPI : totalStoredDjangoJobs + savedJobs.length;
    
    // Ensure we have at least one page, and calculate based on our best estimate of total jobs
    const totalPages = Math.max(
      response.data.total_pages || 
      Math.ceil(totalJobsEstimate / parseInt(page_size)) || 
      1,
      // Make sure we have at least enough pages for the current page
      page_no
    );
    
    console.log(`[getDjangoJobs] API reports total_count: ${response.data.total_count}, total_pages: ${response.data.total_pages}`);
    console.log(`[getDjangoJobs] Using totalJobsEstimate: ${totalJobsEstimate}, totalPages: ${totalPages}`);
    
    // Always ensure we have at least one more page available if we got jobs from the API
    // This encourages exploration of more pages
    const adjustedTotalPages = savedJobs.length >= page_size ? totalPages + 1 : totalPages;
    
    // Final response object
    const responseObj = {
      jobs: savedJobs,
      totalJobs: totalJobsEstimate,
      totalPages: adjustedTotalPages,
      page: parseInt(page_no),
      pageSize: parseInt(page_size),
      success: true,
      source: "api",
      newJobsCreated,
      existingJobsFound
    };
    
    console.log(`[getDjangoJobs] Sending response with ${savedJobs.length} jobs`);
    console.log(`[getDjangoJobs] Function completed at ${new Date().toISOString()}`);
    
    return res.status(200).json(responseObj);
  } catch (error) {
    console.error(`[getDjangoJobs] ERROR at ${new Date().toISOString()}:`, error);
    console.error(`[getDjangoJobs] Error stack:`, error.stack);
    
    // Check if error is from Axios
    if (error.response) {
      console.error(`[getDjangoJobs] API Error Response Status:`, error.response.status);
      console.error(`[getDjangoJobs] API Error Response Data:`, error.response.data);
    }
    
    return res.status(500).json({
      message: `Internal Server Error from getDjangoJobs: ${error.message}`,
      success: false,
      error: error.message,
      errorType: error.name,
      errorTime: new Date().toISOString()
    });
  }
}
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("getJobById called with ID:", jobId, "Type:", typeof jobId);
    console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(jobId));
    // const job = await Job.findOne({ _id: jobId });
    const jobs = await Job.find({});
    console.log("All jobs fetched:", jobs.length, "jobs found");
    const job = await Job.findById(jobId);
    if (!job) {
      console.warn("Job not found for ID:", jobId);
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    console.log("Job found:", job);

    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error("Error in getJobById:", error);
    return res.status(500).json({
      message: `Internal Server Error from getJobById: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    console.log("getAdminJobs called by admin ID:", adminId);

    const jobs = await Job.find({ createdBy: adminId }).populate({
      path: "company",
      createdAt: -1,
    });

    if (!jobs || jobs.length === 0) {
      console.warn("No jobs found for admin:", adminId);
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    console.log(`Admin has posted ${jobs.length} jobs`);

    return res.status(200).json({
      message: "Jobs retrieved successfully",
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAdminJobs:", error);
    return res.status(500).json({
      message: `Internal Server Error from getAdminJobs: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};

export const extractAndUpdateJobData = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Validate jobId
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
        success: false,
      });
    }
    
    // Find the job in MongoDB
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }
    
    // If job is already extracted, return the existing job
    if (job.isExtracted) {
      return res.status(200).json({
        message: "Job data already extracted",
        success: true,
        job,
      });
    }
    
    // Make request to Django API to extract job data
    try {
      const djangoResponse = await axios.post(
        "http://localhost:5000/api/extract_job_data/",
        {
          description: job.description,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      // Update the job with extracted data
      const extractedData = djangoResponse.data;
      
      // Create update object with only valid fields
      const updateData = {
        isExtracted: true,
      };
      
      // Only update fields that have valid values
      if (extractedData.title && extractedData.title.trim() !== "") {
        updateData.title = extractedData.title;
      }
      
      if (extractedData.salary && !isNaN(extractedData.salary) && extractedData.salary > 0) {
        updateData.salary = extractedData.salary;
      }
      
      if (extractedData.experienceLevel !== undefined && extractedData.experienceLevel >= 0) {
        updateData.experienceLevel = extractedData.experienceLevel;
      }
      
      if (extractedData.location && extractedData.location.length > 0) {
        // If location is an array, use the first location
        updateData.location = Array.isArray(extractedData.location) 
          ? extractedData.location[0] 
          : extractedData.location;
      }
      
      if (extractedData.jobType && extractedData.jobType.trim() !== "") {
        updateData.jobType = extractedData.jobType;
      }
      
      if (extractedData.requirements && Array.isArray(extractedData.requirements) && extractedData.requirements.length > 0) {
        updateData.requirements = extractedData.requirements;
      }
      
      // Update the job in MongoDB
      const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        updateData,
        { new: true }
      );
      
      return res.status(200).json({
        message: "Job data extracted and updated successfully",
        success: true,
        job: updatedJob,
      });
      
    } catch (djangoError) {
      console.error("Error extracting job data from Django:", djangoError);
      return res.status(500).json({
        message: "Error extracting job data from Django API",
        success: false,
        error: djangoError.message,
      });
    }
    
  } catch (error) {
    console.error("Error in extractAndUpdateJobData:", error);
    return res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};
