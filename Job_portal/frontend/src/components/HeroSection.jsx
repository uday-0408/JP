import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";
import { setAllJobs } from "@/redux/jobSlice";
import quote from "@/utils/quotes";
import { useEffect } from "react";
import quotes from "@/utils/quotes";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
   const [randomQuote, setRandomQuote] = useState("");

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    dispatch(setAllJobs([])); // Clear previous jobs
    navigate("/browse");
  };
 useEffect(() => {
    // This will run every time HeroSection is mounted (like coming from another page)
    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setRandomQuote(newQuote);
  }, []);
  return (
    <div className="text-center">
      <div className="flex flex-col gap-5 my-10">
        <span className=" mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#F83002] font-medium">
          No. 1 Job Hunt Website
        </span>
        <h1 className="text-5xl font-bold">
          Search, Apply & <br /> Get Your{" "}
          <span className="text-[#6A38C2]">Dream Jobs</span>
        </h1>
        <p>
         {randomQuote ? randomQuote : "Find your dream job with us!"}
        </p>
        <div className="flex w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto">
          <input
            type="text"
            placeholder="Find your dream jobs"
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none border-none w-full"
          />
          <Button
            onClick={searchJobHandler}
            className="rounded-r-full bg-[#6A38C2]"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
