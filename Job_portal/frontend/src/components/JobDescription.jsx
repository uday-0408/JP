import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { setSingleJob } from "@/redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [isApplied, setIsApplied] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState(null);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();

  const applyJobHandler = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsApplied(true); // Update the local state
        const updatedSingleJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  
  // New function to match with existing resume ID
  const handleAutomaticMatch = async () => {
    const userResumeId = user?.profile?.resumeId;
    const djangoJobId = singleJob?.djangoJobId;
    
    if (!userResumeId) {
      // No stored resume ID, open the upload dialog
      setIsResumeModalOpen(true);
      return;
    }
    
    if (!djangoJobId) {
      toast.error("This job doesn't have a Django job ID associated with it");
      return;
    }
    
    setIsLoading(true);
    
    try {
      toast.info("Matching your resume with this job...");
      
      // Call Django match endpoint directly with stored IDs
      const matchUrl = "http://localhost:5000/api/find_jobs/";
      console.log("Requesting match from Django with stored resume_id", userResumeId, "and job_id", djangoJobId);
      
      const matchRes = await fetch(matchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: userResumeId, job_id: djangoJobId }),
      });
      
      if (!matchRes.ok) {
        const txt = await matchRes.text();
        console.error("Match request failed:", txt);
        toast.error("Failed to get match results");
        return;
      }
      
      const responseJson = await matchRes.json();
      console.log("Match response from server:", responseJson);
      
      if (!responseJson || !responseJson.match) {
        console.error("Invalid response format - missing match field:", responseJson);
        toast.error("The server returned an invalid response format");
        return;
      }
      
      // Parse the JSON string in the match field
      let matchJson;
      try {
        matchJson = JSON.parse(responseJson.match);
        console.log("Parsed match JSON:", matchJson);
      } catch (parseError) {
        console.error("Failed to parse match JSON:", parseError, responseJson.match);
        toast.error("Failed to parse match results");
        return;
      }
      
      // Validate the parsed structure
      if (!matchJson || typeof matchJson !== 'object') {
        console.error("Invalid parsed match format:", matchJson);
        toast.error("The server returned an invalid response format");
        return;
      }
      
      // Ensure all array fields exist even if they're empty
      const sanitizedResults = {
        rank: matchJson.rank || 0,
        skills: Array.isArray(matchJson.skills) ? matchJson.skills : [],
        missing_skills: Array.isArray(matchJson.missing_skills) ? matchJson.missing_skills : [],
        project_category: Array.isArray(matchJson.project_category) ? matchJson.project_category : [],
        improvement_suggestions: Array.isArray(matchJson.improvement_suggestions) ? matchJson.improvement_suggestions : [],
        total_experience: matchJson.total_experience || 0
      };
      
      // Show results
      setMatchResults(sanitizedResults);
      setIsResumeModalOpen(true);
    } catch (error) {
      console.error("Error matching resume with stored IDs:", error);
      toast.error(`Failed to match resume: ${error.message}`);
      // Open modal to allow manual upload as fallback
      setIsResumeModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Original handler for manual uploads
  const handleResumeUpload = async () => {
    
    // Regular upload flow if user doesn't have resumeId or direct matching failed
    if (!resumeFile) {
      toast.error("Please upload a resume");
      return;
    }
    
    console.log("Starting resume upload process");
    console.log("Resume file:", resumeFile);
    console.log("Job description length:", singleJob?.description?.length);
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", singleJob?.description || "");

      // Step 1: upload resume to Django resume upload endpoint
      console.log("Uploading resume to Django upload endpoint...");
      const djangoUploadUrl = "http://localhost:5000/api/upload_resume/";
      const uploadForm = new FormData();
      uploadForm.append("file", resumeFile, resumeFile.name);

      const uploadRes = await fetch(djangoUploadUrl, {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("Django upload failed:", errText);
        toast.error("Failed to upload resume to server");
        return;
      }

      const uploadData = await uploadRes.json();
      console.log("Django upload response:", uploadData);

      if (!uploadData.id) {
        toast.error("Django did not return a resume id");
        return;
      }

      const resumeId = uploadData.id;
      
      // Store the resume ID in the user's profile for future use
      if (user && resumeId) {
        try {
          console.log("Updating user profile with resume ID:", resumeId);
          
          // Create form data since the endpoint expects multipart/form-data
          const formData = new FormData();
          formData.append("resumeId", resumeId);
          formData.append("resumeOriginalName", resumeFile.name);
          
          const updateResp = await axios.post("/api/user/profile/update", formData, { 
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
          });
          
          if (updateResp.data.success) {
            console.log("Successfully updated user profile with resume ID");
          }
        } catch (updateErr) {
          console.error("Failed to update user profile with resume ID:", updateErr);
          // Continue with match process even if profile update fails
        }
      }

      // Step 2: call Django groq_match endpoint (find_jobs/) with resume_id and job_id
      const matchUrl = "http://localhost:5000/api/find_jobs/";
      
      if (!djangoJobId) {
        toast.error("This job doesn't have a Django job ID associated with it");
        return;
      }
      
      console.log("Requesting match from Django with resume_id", resumeId, "and job_id", djangoJobId);

      const matchRes = await fetch(matchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: resumeId, job_id: djangoJobId }),
      });

      if (!matchRes.ok) {
        const txt = await matchRes.text();
        console.error("Match request failed:", txt);
        toast.error("Failed to get match results");
        return;
      }

      const responseJson = await matchRes.json();
      console.log("Match response from server:", responseJson);
      
      if (!responseJson || !responseJson.match) {
        console.error("Invalid response format - missing match field:", responseJson);
        toast.error("The server returned an invalid response format");
        return;
      }
      
      // Parse the JSON string in the match field
      let matchJson;
      try {
        matchJson = JSON.parse(responseJson.match);
        console.log("Parsed match JSON:", matchJson);
      } catch (parseError) {
        console.error("Failed to parse match JSON:", parseError, responseJson.match);
        toast.error("Failed to parse match results");
        return;
      }
      
      // Validate the parsed structure
      if (!matchJson || typeof matchJson !== 'object') {
        console.error("Invalid parsed match format:", matchJson);
        toast.error("The server returned an invalid response format");
        return;
      }
      
      // Ensure all array fields exist even if they're empty
      const sanitizedResults = {
        rank: matchJson.rank || 0,
        skills: Array.isArray(matchJson.skills) ? matchJson.skills : [],
        missing_skills: Array.isArray(matchJson.missing_skills) ? matchJson.missing_skills : [],
        project_category: Array.isArray(matchJson.project_category) ? matchJson.project_category : [],
        improvement_suggestions: Array.isArray(matchJson.improvement_suggestions) ? matchJson.improvement_suggestions : [],
        total_experience: matchJson.total_experience || 0
      };
      
      // The Django endpoint directly returns JSON, not a match field that needs parsing
      setMatchResults(sanitizedResults);
    } catch (error) {
      console.error("Error matching resume:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(`Failed to match resume: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
const isAppliedHandler = async () => {
    try {
        const res = await axios.get(`${APPLICATION_API_END_POINT}/is-applied/${jobId}`, {
          withCredentials: true,  
        });
        if (res.data.success) {
          setIsApplied(res.data.isApplied);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
}
  // Function to extract job data from Django API
  const extractJobData = async (job) => {
    if (!job.djangoJobId || job.isExtracted) {
      return job; // No need to extract if it's not a Django job or already extracted
    }
    
    try {
      console.log("Extracting job data for job ID:", job._id);
      toast.info("Extracting structured job data...");
      
      const res = await axios.post(
        `${JOB_API_END_POINT}/extract-job-data/${job._id}`,
        {},
        { withCredentials: true }
      );
      
      if (res.data.success) {
        console.log("Job data extracted successfully:", res.data.job);
        toast.success("Job data extracted successfully");
        return res.data.job; // Return the updated job
      } else {
        console.error("Failed to extract job data:", res.data);
        toast.error("Failed to extract job data");
        return job; // Return the original job
      }
    } catch (error) {
      console.error("Error extracting job data:", error);
      toast.error("Error extracting job data: " + (error.response?.data?.message || error.message));
      return job; // Return the original job
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        
        if (res.data.success) {
          let job = res.data.job;
          
          // If job is from Django and not yet extracted, extract data
          if (job.djangoJobId && !job.isExtracted) {
            job = await extractJobData(job);
          }
          
          dispatch(setSingleJob(job));
        }
        
        // Check if the user has already applied for the job
        await isAppliedHandler();
      } catch (error) {
        console.log(error);
        toast.error("Error fetching job details: " + (error.response?.data?.message || error.message));
      }
    };
    
    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  return (
    <div className="max-w-7xl mx-auto my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">{singleJob?.title}</h1>
          <div className="flex items-center gap-2 mt-4">
            <Badge className={"text-blue-700 font-bold"} variant="ghost">
              {singleJob?.postion} Positions
            </Badge>
            <Badge className={"text-[#F83002] font-bold"} variant="ghost">
              {singleJob?.jobType}
            </Badge>
            <Badge className={"text-[#7209b7] font-bold"} variant="ghost">
              {singleJob?.salary}LPA
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAutomaticMatch}
            className="rounded-lg bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Matching...
              </>
            ) : (
              "Match Your Resume"
            )}
          </Button>
          <Button
            onClick={isApplied ? null : applyJobHandler}
            disabled={isApplied}
            className={`rounded-lg ${
              isApplied
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#7209b7] hover:bg-[#5f32ad]"
            }`}
          >
            {isApplied ? "Already Applied" : "Apply Now"}
          </Button>
        </div>
      </div>
      <h1 className="border-b-2 border-b-gray-300 font-medium py-4">
        Job Description
      </h1>
      <div className="my-4">
        {/* Display badge if job is from Django */}
        {singleJob?.djangoJobId && (
          <div className="mb-4">
            <Badge variant={singleJob?.isExtracted ? "outline" : "secondary"} className="mr-2">
              {singleJob?.isExtracted ? "Django Job (Extracted)" : "Django Job"}
            </Badge>
            {!singleJob?.isExtracted && (
              <span className="text-sm text-gray-500">
                This job's details are being processed for better accuracy
              </span>
            )}
          </div>
        )}
        
        <h1 className="font-bold my-1">
          Role:{}
          <span className="pl-4 font-normal text-gray-800">
            {singleJob?.title}
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Location:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {singleJob?.location}
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Description:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {singleJob?.description}
          </span>
        </h1>
        
        {/* Display requirements if available */}
        {singleJob?.requirements && singleJob.requirements.length > 0 && (
          <div className="my-3">
            <h1 className="font-bold mb-2">Requirements:</h1>
            <ul className="list-disc pl-8 space-y-1">
              {singleJob.requirements.map((req, index) => (
                <li key={index} className="text-gray-800">{req}</li>
              ))}
            </ul>
          </div>
        )}
        
        <h1 className="font-bold my-1">
          Experience:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {singleJob?.experience} yrs
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Salary:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {singleJob?.salary}LPA
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Total Applicants:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {singleJob?.applications?.length}
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Posted Date:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {singleJob?.createdAt.split("T")[0]}
          </span>
        </h1>
      </div>
      
      {/* Resume Match Modal */}
      <Dialog open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Match Your Resume with Job Description</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {!matchResults ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Resume (PDF)
                  </label>
                  <Input 
                    id="resume"
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="cursor-pointer"
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button"
                    onClick={handleResumeUpload}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Match Resume"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-bold text-lg mb-2">Match Score: {matchResults?.rank || 0}/100</h3>
                  
                  {matchResults?.skills && matchResults.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Your Skills:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {matchResults.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-100">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {matchResults?.missing_skills && matchResults.missing_skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Missing Skills:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {matchResults.missing_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-red-100 text-red-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {matchResults?.project_category && matchResults.project_category.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Project Categories:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {matchResults.project_category.map((category, index) => (
                          <Badge key={index} variant="outline" className="bg-green-100">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {matchResults?.improvement_suggestions && matchResults.improvement_suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Improvement Suggestions:</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                        {matchResults.improvement_suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button"
                    onClick={() => {
                      setMatchResults(null);
                      setResumeFile(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Try Another Resume
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDescription;
