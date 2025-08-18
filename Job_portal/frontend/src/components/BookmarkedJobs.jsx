import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import LatestJobCards from './LatestJobCards';
import { Loader2 } from 'lucide-react';
import { BOOKMARK_API_END_POINT } from "../utils/constant";

const BookmarkedJobs = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchBookmarkedJobs = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${BOOKMARK_API_END_POINT}/jobs`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setBookmarkedJobs(response.data.bookmarkedJobs);
        }
      } catch (error) {
        console.error("Error fetching bookmarked jobs:", error);
        toast.error("Failed to fetch bookmarked jobs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarkedJobs();
  }, [isAuthenticated]);
  
  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7209b7]" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-xl font-semibold text-gray-700">Please log in</h3>
        <p className="text-gray-500 mt-2">You need to be logged in to see your bookmarked jobs</p>
      </div>
    );
  }
  
  if (bookmarkedJobs.length === 0) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-xl font-semibold text-gray-700">No bookmarked jobs</h3>
        <p className="text-gray-500 mt-2">Start bookmarking jobs you're interested in!</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Saved Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarkedJobs.map(job => (
          <LatestJobCards key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default BookmarkedJobs;
