import React, { useState, useEffect } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import AIFilterCard from "./AIFilterCard";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useGetDjangoJobs } from "@/hooks/useGetDjangoJobs";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Loader2 } from "lucide-react";

const DjangoJobs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  
  // Use default empty array to prevent "length of undefined" error
  const { djangoJobs = [], pagination = {}, searchedQuery } = useSelector((store) => store.job);
  const { isLoading, error, dataSource } = useGetDjangoJobs(currentPage, pageSize);
  
  // State to store filtered jobs
  const [filteredJobs, setFilteredJobs] = useState(djangoJobs);
  
  // Effect to handle filtering when search query changes
  useEffect(() => {
    if (!djangoJobs || djangoJobs.length === 0) {
      setFilteredJobs([]);
      return;
    }
    
    if (searchedQuery && searchedQuery !== "") {
      // Parse filter values from the search query
      let location = "NA";
      let specialization = "NA";
      let salary = "NA";
      let experience = "NA";
      
      const parts = searchedQuery.split(" | ");
      parts.forEach((part) => {
        if (part.startsWith("Location:"))
          location = part.split("Location:")[1].trim();
        if (part.startsWith("Specialization:"))
          specialization = part.split("Specialization:")[1].trim();
        if (part.startsWith("Salary:"))
          salary = part.split("Salary:")[1].trim();
        if (part.startsWith("Experience:"))
          experience = part.split("Experience:")[1].trim();
      });
      
      // Apply filters
      const filtered = djangoJobs.filter(job => {
        // Location filter
        const matchesLocation = 
          location === "NA" || 
          (job.location && job.location.toLowerCase().includes(location.toLowerCase()));
          
        // Specialization filter (check title and description)
        const matchesSpecialization = 
          specialization === "NA" || 
          (job.title && job.title.toLowerCase().includes(specialization.toLowerCase())) ||
          (job.description && job.description.toLowerCase().includes(specialization.toLowerCase()));
          
        // Salary filter - basic implementation
        const matchesSalary = salary === "NA"; // Simplified as we may not have exact salary info
        
        // Experience filter
        const matchesExperience = 
          experience === "NA" ||
          (experience === "Fresher" && job.experienceLevel === 0) ||
          (experience === "1-2 years" && job.experienceLevel >= 1 && job.experienceLevel <= 2) ||
          (experience === "3-5 years" && job.experienceLevel >= 3 && job.experienceLevel <= 5) ||
          (experience === "5-8 years" && job.experienceLevel >= 5 && job.experienceLevel <= 8) ||
          (experience === "8+ years" && job.experienceLevel >= 8);
        
        return matchesLocation && matchesSpecialization && matchesSalary && matchesExperience;
      });
      
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(djangoJobs);
    }
  }, [djangoJobs, searchedQuery]);

  // Handle pagination
  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    console.log("Moving to previous page:", newPage);
    setCurrentPage(newPage);
  };

  const handleNextPage = () => {
    // Always allow going to the next page unless we've received less than a full page of results
    // This allows exploration of more Django jobs even if we don't know the exact total
    const hasMorePages = djangoJobs && djangoJobs.length === pageSize;
    const totalPagesValue = pagination?.totalPages || 1;
    
    // If we have a full page of results, we can go to the next page
    // Otherwise, use the calculated total pages as a limit
    const newPage = hasMorePages ? currentPage + 1 : Math.min(currentPage + 1, totalPagesValue);
    
    console.log("Moving to next page:", newPage, 
      hasMorePages ? "(might have more pages)" : `(of ${totalPagesValue} total pages)`);
    console.log("Pagination will first check MongoDB for jobs, then fetch from Django API if needed");
    
    // Update the current page - the hook will automatically handle checking MongoDB first
    setCurrentPage(newPage);
  };
  
  console.log("Current pagination state:", {
    currentPage,
    pageSize,
    totalPages: pagination?.totalPages,
    totalJobs: pagination?.totalJobs,
    jobsCount: djangoJobs?.length
  });

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto mt-8 p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Error Loading Jobs</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI-Powered Job Recommendations</h1>
          <p className="text-gray-600">
            Discover job opportunities collected from various sources by our AI system.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter sidebar */}
          <div className="md:w-[300px] lg:w-[320px] shrink-0">
            <div className="sticky top-20">
              <AIFilterCard />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {!filteredJobs || filteredJobs.length <= 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">No jobs found</h2>
            <p className="text-gray-600">
              We couldn't find any jobs matching your criteria right now.
              Please check back later or try different filters.
            </p>
          </div>
        ) : (
          <div className="pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  key={job?._id}
                >
                  <Job job={job} />
                </motion.div>
              ))}
            </div>
            
              {/* Data source indicator with enhanced information */}
              <div className="text-center mb-2 mt-10">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  dataSource === 'mongodb' 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  {dataSource === 'mongodb' 
                    ? 'Using cached jobs from database' 
                    : 'Fresh jobs from API'}
                </span>
                {pagination?.source && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({pagination.source})
                  </span>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Showing page {pagination?.currentPage || currentPage} of {pagination?.totalPages || 1}
                  {' '}({pagination?.totalJobs || 0} total jobs)
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 mt-4 mb-8">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="flex items-center px-4 py-2 border rounded"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>              <div className="flex items-center gap-2">
                {/* Page numbers */}
                {Array.from({ length: pagination?.totalPages || 1 }, (_, i) => i + 1)
                  .filter(page => (
                    // Show first page, current page, last page, and pages around current
                    page === 1 || 
                    page === pagination?.totalPages || 
                    Math.abs(page - currentPage) <= 1
                  ))
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <Button
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        className={`w-8 h-8 p-0 ${page === currentPage ? 'bg-primary text-white' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))
                }
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNextPage}
                disabled={
                  // Only disable when we're at the last page AND no more jobs were returned
                  currentPage >= (pagination?.totalPages || 1) && 
                  (!djangoJobs || djangoJobs.length < pageSize)
                }
                className="flex items-center px-4 py-2 border rounded"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjangoJobs;
