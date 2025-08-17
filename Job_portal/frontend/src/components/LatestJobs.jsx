import React from "react";
import LatestJobCards from "./LatestJobCards";
import { useSelector } from "react-redux";

// const randomJobs = [1, 2, 3, 4, 5, 6, 7, 8];

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);
  return (
    <div className="max-w-7xl mx-auto my-auto">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        <span className="text-[#6A38C2]">Latest & high paid </span>
        Job Openings
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-5">
        {/* multiple job cards :) */}
        {
          // slice 0 tp 6
          allJobs.length <= 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-lg text-gray-500">No jobs available at this time.</p>
              <p className="text-sm text-gray-400">Please check back later for new opportunities.</p>
            </div>
          ) : (
            allJobs
              ?.slice(0, 6)
              .map((job) => <LatestJobCards key={job._id} job={job} />)
          )
        }
      </div>
    </div>
  );
};

export default LatestJobs;
