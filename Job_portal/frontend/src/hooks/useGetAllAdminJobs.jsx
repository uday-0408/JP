import { setAllAdminJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // ✅ Add this import
import { toast } from "sonner";

const useGetAllAdminJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Add this

  useEffect(() => {
    const fetchAllAdminJobs = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setAllAdminJobs(res.data.jobs));
        }
      } catch (error) {
        console.log("error from useGetAllAdminJobs hook: " + error);
        // ✅ Add 401 error handling
        if (error.response?.status === 401) {
          console.warn("Unauthorized access, redirecting to login");
          toast.warning("LOgin to continue");
          navigate("/login");
        }
      }
    };
    fetchAllAdminJobs();
  }, [dispatch, navigate]); // ✅ Add dependencies
};

export default useGetAllAdminJobs;
