import { setAllJobs, setPagination } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export const useGetAllJobs = (page = 1, limit = 9) => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState('mongodb');
    
    useEffect(() => {
        const fetchAllJobs = async () => {
            setIsLoading(true);
            try {
                const url = `${JOB_API_END_POINT}/get?keyword=${searchedQuery}&page=${page}&limit=${limit}`;
                console.log("Fetching regular jobs from:", url);
                
                const res = await axios.get(
                    url,
                    { withCredentials: true }
                );
                
                console.log("Regular jobs fetched:", res.data);
                if (res.data.success) {
                    // Ensure we always have a valid array
                    const jobs = Array.isArray(res.data.jobs) ? res.data.jobs : [];
                    dispatch(setAllJobs(jobs));
                    
                    // Store the source of data
                    setDataSource(res.data.source || 'mongodb');
                    
                    // Update pagination data
                    dispatch(setPagination({
                        currentPage: res.data.page || page,
                        pageSize: res.data.pageSize || limit,
                        totalPages: res.data.totalPages || 0,
                        totalJobs: res.data.totalJobs || 0,
                        source: res.data.source || 'mongodb',
                        message: res.data.message || ''
                    }));
                    
                    if (jobs.length === 0) {
                        console.log("No jobs found matching criteria, but request was successful");
                    } else {
                        console.log(`Using ${jobs.length} jobs from source: ${res.data.source || 'mongodb'}`);
                    }
                    
                    // Clear any previous errors
                    setError(null);
                } else {
                    console.error("API returned success: false");
                    dispatch(setAllJobs([]));
                    setError(res.data.message || "No jobs found matching your criteria");
                }
            } catch (error) {
                console.error("Error fetching regular jobs:", error);
                dispatch(setAllJobs([]));
                setError(error.message || "Failed to fetch jobs");
            } finally {
                setIsLoading(false);
            }
        }
        fetchAllJobs();
    }, [page, limit, searchedQuery, dispatch])
    
    return { isLoading, error, dataSource };
}

