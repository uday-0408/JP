import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { formatJobDate } from "../utils/formatJobDate";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { BOOKMARK_API_END_POINT, USER_API_END_POINT } from "../utils/constant";
import useAuthVerifier from "../hooks/useAuthVerifier";
import AuthDebugger from "./debug/AuthDebugger";

const Job = ({ job }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useSelector(state => {
    console.log("Current Redux Auth State:", state.auth);
    return state.auth;
  });
  const { verifyAuth, isVerifying } = useAuthVerifier();
  
  // Utility function to truncate and format description
  const formatDescription = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };
  
  // Check if job is bookmarked when component mounts
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      // Check only if user exists and job exists
      if (!isAuthenticated || !user || !job?._id) {
        console.log("Skipping bookmark check - authentication or job missing", { 
          isAuthenticated,
          userExists: !!user, 
          jobIdExists: !!job?._id 
        });
        return;
      }
      
      try {
        const response = await axios.get(`${BOOKMARK_API_END_POINT}/status/${job._id}`, {
          withCredentials: true
        });
        console.log("Bookmark status response:", response.data);
        setIsBookmarked(response.data.isBookmarked);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };
    
    checkBookmarkStatus();
  }, [job?._id, user, isAuthenticated]);
  
  // Toggle bookmark status
  const handleToggleBookmark = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Bookmark button clicked");
    console.log("Auth state:", { isAuthenticated, user: user ? "exists" : "null" });
    
    // Check if cookie exists and log it
    console.log("🍪 Checking cookies:");
    document.cookie.split(';').forEach(cookie => {
      console.log(`🍪 Cookie: ${cookie.trim()}`);
    });
    
    // Use our auth verifier to check and fix authentication state
    setIsLoading(true);
    const authVerified = await verifyAuth();
    
    if (!authVerified) {
      console.log("❌ Authentication verification failed");
      toast.error("Please login to bookmark jobs");
      alert("You need to login to bookmark jobs");
      navigate("/login");
      setIsLoading(false);
      return;
    }
    
    console.log("✅ Authentication verified successfully");
    
    // At this point we should have valid authentication
    
    if (!job || !job._id) {
      console.error("Job object or job ID is missing", job);
      toast.error("Cannot bookmark this job - invalid job data");
      alert("Error: Job data is missing or invalid");
      return;
    }
    
      
      // We're already in loading state from before, no need to set it again
      try {
        console.log("📤 Sending bookmark toggle request for job:", job._id);
        const response = await axios.post(`${BOOKMARK_API_END_POINT}/toggle`, {
          jobId: job._id
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        });      console.log("Bookmark toggle response:", response.data);
      alert("Bookmark response: " + JSON.stringify(response.data));
      
      setIsBookmarked(response.data.isBookmarked);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Error: " + error.message);
      toast.error(error.response?.data?.message || "Error bookmarking job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 rounded-xl shadow-lg bg-white border border-gray-100 max-w-full break-words h-[26rem] flex flex-col">
      <AuthDebugger />
      {/* Top Row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">{formatJobDate(job?.createdAt)}</p>
        <button 
          type="button"
          style={{ 
            padding: '8px', 
            borderRadius: '50%',
            border: '1px solid #ddd',
            background: isLoading ? '#f5f5f5' : 'white',
            color: isBookmarked ? '#2563eb' : 'black',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          onClick={(e) => {
            console.log("Bookmark button clicked - Direct event handler");
            alert("Bookmark button clicked! Job ID: " + job?._id);
            handleToggleBookmark(e);
          }}
          disabled={isLoading}
        >
          {isLoading ? "⏳" : (isBookmarked ? "✅" : "🔖")}
        </button>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-shrink-0">
          <Avatar className="w-12 h-12">
            <AvatarImage src={job?.company?.logo} alt="logo" />
          </Avatar>
        </div>
        <div>
          <h2 className="font-semibold text-lg text-gray-800">
            {job?.company?.name}
          </h2>
          <p className="text-sm text-gray-500">{job?.location}</p>
        </div>
      </div>

      {/* Job Title & Description */}
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">
          {job?.title}
        </h3>
        <div 
          className="relative group" 
          title={job?.description?.length > 200 ? "Click 'Details' to read full description" : ""}
        >
          <p className="text-sm text-gray-600 line-clamp-3 h-[4.5rem] overflow-hidden">
            {job?.description?.slice(0, 200)}{job?.description?.length > 200 ? "..." : ""}
          </p>
          {job?.description?.length > 200 && (
            <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent w-1/3 h-full"></div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-3 mb-2 min-h-[2rem]">
        <Badge className="bg-blue-100 text-blue-700 font-semibold">
          {job?.position || 1} {job?.position === 1 ? "Position" : "Positions"}
        </Badge>
        <Badge className="bg-green-100 text-green-700 font-semibold">
          {job?.jobType || "Full-time"}
        </Badge>
        <Badge className="bg-purple-100 text-purple-700 font-semibold">
          {job?.salary ? `${job.salary} LPA` : "Competitive"}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-auto pt-4">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant="outline"
          className="flex-1 min-w-[120px] text-gray-700 border-gray-300 hover:bg-gray-100"
        >
          Details
        </Button>
        <Button 
          onClick={handleToggleBookmark} 
          disabled={isLoading}
          className={`flex-1 min-w-[120px] ${isBookmarked 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-[#7209b7] hover:bg-[#5e0791]'} text-white`}
        >
          {isLoading ? "Saving..." : isBookmarked ? "Bookmarked ✓" : "Save for Later"}
        </Button>
      </div>
    </div>
  );
};

export default Job;
