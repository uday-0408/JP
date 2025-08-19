import React from "react";
import Navbar from "./shared/Navbar";
import EnhancedFilterCard from "./EnhancedFilterCard";
import Job from "./Job";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useGetAllJobs } from "@/hooks/useGetAllJobs";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const Jobs = () => {
  const { allJobs, searchedQuery, pagination = {} } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  
  // Get jobs with pagination
  const { isLoading, error, dataSource } = useGetAllJobs(currentPage, pageSize);

  useEffect(() => {
    if (searchedQuery !== "") {
      // Default values
      let location = "NA";
      let industry = "NA";
      let salary = "NA";

      // Parse the searchedQuery string
      const parts = searchedQuery.split(" | ");
      parts.forEach((part) => {
        if (part.startsWith("Location:"))
          location = part.split("Location:")[1].trim();
        if (part.startsWith("Industry:"))
          industry = part.split("Industry:")[1].trim();
        if (part.startsWith("Salary:"))
          salary = part.split("Salary:")[1].trim();
      });

      const filteredJobs = allJobs.filter((job) => {
        const matchesLocation =
          location === "NA" ||
          job.location.toLowerCase() === location.toLowerCase();
        const matchesIndustry =
          industry === "NA" ||
          job.title.toLowerCase().includes(industry.toLowerCase());
        const matchesSalary = (() => {
          if (salary === "NA") return true;
          const [min, max] = salary.includes("to")
            ? salary
                .replace(/[^0-9 to]/g, "")
                .split("to")
                .map((s) => parseInt(s.trim()))
            : salary.split("-").map((s) => parseInt(s.replace(/\D/g, "")));

          return job.salary >= min * 12 && job.salary <= max * 12;
        })();

        return matchesLocation && matchesIndustry && matchesSalary;
      });

      setFilterJobs(filteredJobs);
    } else {
      setFilterJobs(allJobs);
    }
  }, [allJobs, searchedQuery]);

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, pagination?.totalPages || 1));
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto mt-5">
          <div className="flex gap-5">
            <div className="w-[20%] sticky top-20 self-start">
              <EnhancedFilterCard />
            </div>
            <div className="flex-1 flex justify-center items-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading jobs...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto mt-5">
          <div className="flex gap-5">
            <div className="w-[20%] sticky top-20 self-start">
              <EnhancedFilterCard />
            </div>
            <div className="flex-1">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Error Loading Jobs</h2>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-5">
        <div className="flex gap-5">
          <div className="w-[20%] sticky top-20 self-start">
            <EnhancedFilterCard />
          </div>
          {!allJobs || allJobs.length <= 0 ? (
            <div className="flex-1">
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <h2 className="text-xl font-semibold mb-2">No jobs found</h2>
                <p className="text-gray-600">
                  We couldn't find any jobs matching your criteria right now.
                  {searchedQuery && (
                    <span className="block mt-2">
                      Try removing some filters or checking different categories.
                    </span>
                  )}
                </p>
                {searchedQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      // Clear filters by refreshing the page
                      window.location.href = "/jobs";
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterJobs.map((job) => (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    key={job?._id}
                  >
                    <Job job={job} />
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {/* Data source indicator */}
              {dataSource && (
                <div className="text-center mb-2 mt-6">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">
                    Data from: {dataSource === 'mongodb' ? 'Database' : 'API'}
                  </span>
                </div>
              )}
              
              <div className="flex justify-center items-center gap-4 mt-4 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {pagination?.totalPages || 1}
                </span>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= (pagination?.totalPages || 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
