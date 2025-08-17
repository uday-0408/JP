import React from 'react';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Bookmark, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatJobDate } from "../utils/formatJobDate";

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    
    // Utility function to truncate and format description
    const formatDescription = (text, maxLength = 150) => {
      if (!text) return "";
      return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    return (
        <div className="p-4 md:p-5 rounded-xl shadow-lg bg-white border border-gray-100 max-w-full break-words h-[26rem] flex flex-col hover:shadow-xl transition-shadow">
            {/* Top Row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-500">{formatJobDate(job?.createdAt)}</p>
                <Button size="icon" variant="ghost" className="rounded-full">
                    <Bookmark className="w-5 h-5" />
                </Button>
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
