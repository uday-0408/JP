import { setCompanies } from "@/redux/companySlice";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // ✅ Add this import
import { toast } from "sonner";

const useGetAllCompanies = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Add this

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${COMPANY_API_END_POINT}/get`, {
          withCredentials: true,
        });
        console.log("called");
        if (res.data.success) {
          dispatch(setCompanies(res.data.companies));
        }
      } catch (error) {
        console.log("error from useGetAllCompanies hook: " + error);
        // ✅ Add 401 error handling
        if (error.response?.status === 401) {
          console.warn("Unauthorized access, redirecting to login");
          toast.warning("LOgin to continue");
          navigate("/login");
        }
      }
    };
    fetchCompanies();
  }, [dispatch, navigate]); // ✅ Add dependencies
};

export default useGetAllCompanies;
