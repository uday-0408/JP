import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { Button } from "./ui/button";
import { Check, Filter, MapPin, Briefcase, BadgeDollarSign, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

// AI-focused filter data
const aiFilterData = [
  {
    filterType: "Location",
    icon: <MapPin className="w-4 h-4 text-gray-500" />,
    array: ["Remote", "Hybrid", "On-site"],
  },
  {
    filterType: "AI Specialization",
    icon: <Brain className="w-4 h-4 text-gray-500" />,
    array: ["Machine Learning", "Natural Language Processing", "Computer Vision", 
      "Deep Learning", "Generative AI", "MLOps", "Data Science", "AI Research"]
  },
  {
    filterType: "Salary Range",
    icon: <BadgeDollarSign className="w-4 h-4 text-gray-500" />,
    array: ["0-5 LPA", "5-10 LPA", "10-20 LPA", "20-30 LPA", "30+ LPA"],
  },
  {
    filterType: "Experience",
    icon: <Filter className="w-4 h-4 text-gray-500" />,
    array: ["Fresher", "1-2 years", "3-5 years", "5-8 years", "8+ years"],
  }
];

const AIFilterCard = () => {
  const [location, setLocation] = useState("NA");
  const [specialization, setSpecialization] = useState("NA");
  const [salary, setSalary] = useState("NA");
  const [experience, setExperience] = useState("NA");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [accordionValues, setAccordionValues] = useState(["location"]);
  const dispatch = useDispatch();

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (location !== "NA") count++;
    if (specialization !== "NA") count++;
    if (salary !== "NA") count++;
    if (experience !== "NA") count++;
    setActiveFiltersCount(count);
  }, [location, specialization, salary, experience]);

  // Dispatch the search query
  useEffect(() => {
    const combinedQuery = `Location: ${location} | Specialization: ${specialization} | Salary: ${salary} | Experience: ${experience}`;
    dispatch(setSearchedQuery(combinedQuery));
  }, [location, specialization, salary, experience, dispatch]);

  const clearFilters = () => {
    setLocation("NA");
    setSpecialization("NA");
    setSalary("NA");
    setExperience("NA");
  };

  // Set value for a specific filter
  const setFilterValue = (filterType, value) => {
    switch(filterType) {
      case "Location":
        setLocation(prev => prev === value ? "NA" : value);
        break;
      case "AI Specialization":
        setSpecialization(prev => prev === value ? "NA" : value);
        break;
      case "Salary Range":
        setSalary(prev => prev === value ? "NA" : value);
        break;
      case "Experience":
        setExperience(prev => prev === value ? "NA" : value);
        break;
      default:
        break;
    }
  };

  // Get current value for a specific filter
  const getCurrentValue = (filterType) => {
    switch(filterType) {
      case "Location": return location;
      case "AI Specialization": return specialization;
      case "Salary Range": return salary;
      case "Experience": return experience;
      default: return "NA";
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="font-medium text-gray-800">Filter AI Jobs</h2>
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-8 text-blue-600 hover:text-blue-800"
          >
            Clear All
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        value={accordionValues}
        onValueChange={setAccordionValues}
        className="space-y-2"
      >
        {aiFilterData.map((filter) => (
          <AccordionItem
            key={filter.filterType}
            value={filter.filterType.toLowerCase().replace(/\s+/g, '-')}
            className="border-b-0"
          >
            <AccordionTrigger className="py-3 rounded-md hover:bg-slate-50 px-2">
              <div className="flex items-center gap-2">
                {filter.icon}
                <span className="text-sm font-medium">{filter.filterType}</span>
                {getCurrentValue(filter.filterType) !== "NA" && (
                  <div className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                    1
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              <div className="space-y-2 mt-2">
                {filter.array.map((value) => {
                  const isSelected = getCurrentValue(filter.filterType) === value;
                  return (
                    <div
                      key={value}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm",
                        isSelected
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-slate-50"
                      )}
                      onClick={() => setFilterValue(filter.filterType, value)}
                    >
                      <span className="font-medium">{value}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {location !== "NA" && (
              <FilterBadge 
                label={location} 
                onRemove={() => setLocation("NA")} 
              />
            )}
            {specialization !== "NA" && (
              <FilterBadge 
                label={specialization} 
                onRemove={() => setSpecialization("NA")} 
              />
            )}
            {salary !== "NA" && (
              <FilterBadge 
                label={salary} 
                onRemove={() => setSalary("NA")} 
              />
            )}
            {experience !== "NA" && (
              <FilterBadge 
                label={experience} 
                onRemove={() => setExperience("NA")} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Filter badge component
const FilterBadge = ({ label, onRemove }) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
      <span className="truncate max-w-[100px]">{label}</span>
      <button 
        onClick={onRemove}
        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary/20"
      >
        ×
      </button>
    </div>
  );
};

export default AIFilterCard;
