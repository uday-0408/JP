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
  
  const handleResumeUpload = async () => {
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
      
      console.log("FormData created, sending request to API...");
      console.log("Doing from the handleResumeUpload");
      
      // Important: When sending FormData, do NOT set Content-Type header
      // Axios will automatically set the correct Content-Type with boundary
      const response = await axios.post(
        "http://localhost:5000/api/match_resume_job/",
        formData,
        {
          headers: {
            // Let Axios set this automatically for FormData
            // "Content-Type": "multipart/form-data", 
          },
          withCredentials: false
        }
      );
      
        console.log("API response received:", response.data);
        
        // Alert with response data to help with debugging
        alert(`Response received from server: ${JSON.stringify(response.data)}`);
        
        // Check if response.data.match exists
        if (!response.data.match) {
          console.error("No match data in response:", response.data);
          toast.error("Invalid response from server - no match data found");
          return;
        }      try {
        // Parse the match string to JSON object
        console.log("Raw match data:", response.data.match);
        const matchData = JSON.parse(response.data.match);
        console.log("Parsed match data:", matchData);
        setMatchResults(matchData);
      } catch (parseError) {
        console.error("Error parsing match data:", parseError);
        console.error("Raw data that failed to parse:", response.data.match);
        toast.error("Failed to parse match results");
      }
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
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
        }
        // Check if the user has already applied for the job
        await isAppliedHandler();
      } catch (error) {
        console.log(error);
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
            onClick={() => setIsResumeModalOpen(true)}
            className="rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            Match Your Resume
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
                  <h3 className="font-bold text-lg mb-2">Match Score: {matchResults.rank}/100</h3>
                  
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
                  
                  <div>
                    <h4 className="font-semibold">Improvement Suggestions:</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                      {matchResults.improvement_suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
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
