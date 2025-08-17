import { setDjangoJobs, setPagination } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export const useGetDjangoJobs = (pageNo = 1, pageSize = 6) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState(''); // Track where the data came from
    const { djangoJobs } = useSelector(store => store.job);
    
    useEffect(() => {
        const fetchDjangoJobs = async () => {
            setIsLoading(true);
            try {
                const url = `${JOB_API_END_POINT}/django-jobs?page_no=${pageNo}&page_size=${pageSize}`;
                console.log("Fetching Django jobs from:", url);
                
                const res = await axios.get(
                    url,
                    { withCredentials: true }
                );
                
                console.log("Django jobs fetched:", res.data);
                if (res.data.success) {
                    // Ensure we always have a valid array, even if response is missing jobs
                    const jobs = Array.isArray(res.data.jobs) ? res.data.jobs : [];
                    dispatch(setDjangoJobs(jobs));
                    
                    // Store the source of data for display with enhanced information
                    const source = res.data.source || 'api';
                    setDataSource(source);
                    
                    // Update pagination data with enhanced source information
                    dispatch(setPagination({
                        currentPage: res.data.page || pageNo,
                        pageSize: res.data.pageSize || pageSize,
                        totalPages: res.data.totalPages || 1,
                        totalJobs: res.data.totalJobs || jobs.length,
                        source: source,
                        sourceDetails: source === 'mongodb' 
                            ? 'Using cached jobs from database' 
                            : 'Fetched fresh jobs from API',
                        lastFetched: new Date().toISOString()
                    }));
                    
                    console.log(`Using ${jobs.length} jobs from source: ${res.data.source || 'api'}`);
                } else {
                    console.error("No Django jobs found");
                    // Explicitly set empty array
                    dispatch(setDjangoJobs([]));
                    // Reset pagination with defaults
                    dispatch(setPagination({
                        currentPage: 1,
                        pageSize: pageSize,
                        totalPages: 1,
                        totalJobs: 0
                    }));
                }
            } catch (error) {
                console.error("Error fetching Django jobs:", error);
                setError(error.message || "Failed to fetch Django jobs");
                
                // Set empty array on error
                dispatch(setDjangoJobs([]));
                // Reset pagination with defaults
                dispatch(setPagination({
                    currentPage: 1,
                    pageSize: pageSize,
                    totalPages: 1,
                    totalJobs: 0
                }));
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDjangoJobs();
        console.log("Fetching Django jobs for page:", pageNo, "with size:", pageSize);
    }, [pageNo, pageSize, dispatch]);

    return { isLoading, error, dataSource };
};
