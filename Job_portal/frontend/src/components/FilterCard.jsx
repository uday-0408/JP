import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { Button } from "./ui/button";
import { Check, Filter, MapPin, Briefcase, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

// Enhanced filter data
const enhancedFilterData = [
  {
    filterType: "Location",
    icon: <MapPin className="w-4 h-4 text-gray-500" />,
    array: ["Remote", "Ahmedabad", "Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Chennai", "Kolkata"],
  },
  {
    filterType: "Job Type",
    icon: <Briefcase className="w-4 h-4 text-gray-500" />,
    array: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "Data Scientist", "UI/UX Designer", "Mobile Developer", "QA Engineer", "Project Manager"],
  },
  {
    filterType: "Salary Range",
    icon: <BadgeDollarSign className="w-4 h-4 text-gray-500" />,
    array: ["0-3 LPA", "3-6 LPA", "6-10 LPA", "10-15 LPA", "15-25 LPA", "25+ LPA"],
  },
  {
    filterType: "Experience",
    icon: <Filter className="w-4 h-4 text-gray-500" />,
    array: ["Fresher", "1-2 years", "3-5 years", "5-8 years", "8+ years"],
  }
];

const FilterCard = () => {
  const [location, setLocation] = useState("NA");
  const [jobType, setJobType] = useState("NA");
  const [salary, setSalary] = useState("NA");
  const [experience, setExperience] = useState("NA");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [accordionValues, setAccordionValues] = useState(["location"]);
  const dispatch = useDispatch();

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (location !== "NA") count++;
    if (jobType !== "NA") count++;
    if (salary !== "NA") count++;
    if (experience !== "NA") count++;
    setActiveFiltersCount(count);
  }, [location, jobType, salary, experience]);

  // Dispatch the search query
  useEffect(() => {
    const combinedQuery = `Location: ${location} | Industry: ${jobType} | Salary: ${salary} | Experience: ${experience}`;
    dispatch(setSearchedQuery(combinedQuery));
  }, [location, jobType, salary, experience, dispatch]);

  const clearFilters = () => {
    setLocation("NA");
    setJobType("NA");
    setSalary("NA");
    setExperience("NA");
  };

  // Set value for a specific filter
  const setFilterValue = (filterType, value) => {
    switch(filterType) {
      case "Location":
        setLocation(prev => prev === value ? "NA" : value);
        break;
      case "Job Type":
        setJobType(prev => prev === value ? "NA" : value);
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
      case "Job Type": return jobType;
      case "Salary Range": return salary;
      case "Experience": return experience;
      default: return "NA";
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-lg">Filters</h1>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center bg-primary text-white rounded-full h-5 w-5 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            onClick={clearFilters} 
            className="text-sm h-8 px-2 hover:bg-gray-100"
          >
            Clear all
          </Button>
        )}
      </div>

      <Accordion 
        type="multiple" 
        value={accordionValues} 
        onValueChange={setAccordionValues} 
        className="space-y-2"
      >
        {enhancedFilterData.map((filter, index) => {
          const id = filter.filterType.toLowerCase().replace(/\s+/g, '');
          return (
            <AccordionItem 
              key={id} 
              value={id} 
              className="border border-gray-100 rounded-md overflow-hidden"
            >
              <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 text-sm">
                <div className="flex items-center gap-2">
                  {filter.icon}
                  <span className="font-medium">{filter.filterType}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-1">
                <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                  {filter.array.map((item, idx) => {
                    const checkboxId = `${id}-${idx}`;
                    const isSelected = getCurrentValue(filter.filterType) === item;
                    return (
                      <div 
                        key={checkboxId}
                        onClick={() => setFilterValue(filter.filterType, item)}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center",
                          isSelected ? "border-primary bg-primary/10" : "border-gray-300"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-primary" />}
                        </div>
                        <Label 
                          htmlFor={checkboxId} 
                          className={cn(
                            "text-sm cursor-pointer",
                            isSelected ? "font-medium" : ""
                          )}
                        >
                          {item}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {location !== "NA" && (
              <FilterBadge 
                label={location} 
                onRemove={() => setLocation("NA")} 
              />
            )}
            {jobType !== "NA" && (
              <FilterBadge 
                label={jobType} 
                onRemove={() => setJobType("NA")} 
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

export default FilterCard;
