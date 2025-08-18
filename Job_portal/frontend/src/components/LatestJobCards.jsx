import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatJobDate } from "../utils/formatJobDate";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { BOOKMARK_API_END_POINT, USER_API_END_POINT } from "../utils/constant";
import useAuthVerifier from "../hooks/useAuthVerifier";
import AuthDebugger from "./debug/AuthDebugger";

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const { verifyAuth, isVerifying } = useAuthVerifier();
    
    // Utility function to truncate and format description
    const formatDescription = (text, maxLength = 150) => {
      if (!text) return "";
      return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };
    
    // Check if job is bookmarked when component mounts
    useEffect(() => {
      const checkBookmarkStatus = async () => {
        console.log("🔍 LatestJobCards - Checking bookmark status", {
          isAuthenticated,
          userExists: !!user,
          jobId: job?._id
        });
        
        if (!isAuthenticated || !user) {
          console.log("⚠️ Skipping bookmark check - not authenticated or no user");
          
          // Check cookies anyway for debugging
          console.log("🍪 Checking cookies in component:");
          document.cookie.split(';').forEach(cookie => {
            console.log(`🍪 Cookie: ${cookie.trim()}`);
          });
          
          return;
        }
        
        try {
          // First check if cookies are working with our test endpoint
          const cookieTest = await fetch(`${BOOKMARK_API_END_POINT}/cookie-check`, {
            credentials: 'include'
          }).then(r => r.json());
          
          console.log("🍪 Cookie test result:", cookieTest);
          
          const response = await axios.get(`${BOOKMARK_API_END_POINT}/status/${job._id}`, {
            withCredentials: true
          });
          console.log("✅ Bookmark status response:", response.data);
          setIsBookmarked(response.data.isBookmarked);
        } catch (error) {
          console.error("❌ Error checking bookmark status:", error);
        }
      };
      
      checkBookmarkStatus();
    }, [job._id, isAuthenticated, user]);
    
    // Toggle bookmark status
    const handleToggleBookmark = async (e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      
      console.log("🔍 handleToggleBookmark function called");
      console.log("📊 Auth state:", { isAuthenticated, userId: user?._id });
      console.log("📦 Job data:", { 
        id: job?._id, 
        title: job?.title,
        exists: job ? "yes" : "no"
      });
      
      // Use our auth verifier to check and fix authentication state
      setIsLoading(true);
      const authVerified = await verifyAuth();
      
      if (!authVerified) {
        console.log("❌ Authentication verification failed");
        console.log("❌ isAuthenticated:", isAuthenticated);
        console.log("❌ user:", user ? "exists" : "null");
        toast.error("Please login to bookmark jobs");
        alert("You need to login to bookmark jobs");
        navigate("/login");
        setIsLoading(false);
        return;
      }
      
      console.log("✅ Authentication verified successfully");
      
      if (!job || !job._id) {
        console.error("❌ Job object or job ID is missing", job);
        toast.error("Cannot bookmark this job - invalid job data");
        alert("Error: Job data is missing or invalid");
        return;
      }
      
      // We're already in loading state from above, no need to set it again
      try {
        console.log("📤 Making request to:", `${BOOKMARK_API_END_POINT}/toggle`);
        console.log("📦 With data:", { jobId: job?._id });
        
        // Use a simple fetch to test connectivity to the server
        console.log("🔍 Testing server connectivity...");
        
        fetch(`${BOOKMARK_API_END_POINT}/test-auth`, { 
          credentials: 'include',
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        })
        .then(resp => {
          console.log("🔍 Fetch test response status:", resp.status);
          return resp.json();
        })
        .then(data => console.log("🔍 Fetch test data:", data))
        .catch(err => console.error("🔍 Fetch test failed:", err));
        
        // Try direct fetch request for bookmark
        console.log("📤 Attempting direct fetch request...");
        
        const toggleResponse = await fetch(`${BOOKMARK_API_END_POINT}/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest' // Add this to help with CORS
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({ jobId: job._id }),
          mode: 'cors' // Ensure CORS mode is explicitly set
        });
        
        console.log("📥 Toggle response status:", toggleResponse.status);
        const responseData = await toggleResponse.json();
        console.log("📥 Toggle response data:", responseData);
        
        // Show alert with response data to help with debugging
        alert(`Bookmark response: ${JSON.stringify(responseData)}`);
        
        // If fetch worked, skip axios
        if (toggleResponse.ok) {
          console.log("✅ Fetch request succeeded, skipping axios");
          setIsBookmarked(responseData.isBookmarked);
          toast.success(responseData.message);
          return;
        }
        
        // If fetch failed, try axios as fallback
        console.log("⚠️ Fetch request failed, trying axios as fallback");
        const response = await axios.post(`${BOOKMARK_API_END_POINT}/toggle`, {
          jobId: job._id
        }, {
          withCredentials: true
        });
        
        console.log("Bookmark toggle response:", response.data);
        setIsBookmarked(response.data.isBookmarked);
        toast.success(response.data.message);
      } catch (error) {
        console.error("Error toggling bookmark:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error(error.response?.data?.message || "Error bookmarking job");
      } finally {
        setIsLoading(false);
      }
    };

    return (
        <div className="p-4 md:p-5 rounded-xl shadow-lg bg-white border border-gray-100 max-w-full break-words h-[26rem] flex flex-col hover:shadow-xl transition-shadow">
            <AuthDebugger />
            {/* Top Row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-500">{formatJobDate(job?.createdAt)}</p>
                {/* Regular button instead of UI component for testing */}
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
                    console.log("🖱️ Bookmark button clicked - Direct event handler");
                    alert("Bookmark button clicked! Check console for details.");
                    e.preventDefault();
                    e.stopPropagation();
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
                    <p className="text-sm text-gray-500">{job?.location || "Remote"}</p>
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
            <div className="flex flex-wrap gap-3 mt-auto pt-3">
                <Button
                    onClick={() => navigate(`/description/${job?._id}`)}
                    className="flex-1 bg-[#7209b7] text-white hover:bg-[#5e0791]"
                >
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};

export default LatestJobCards;
