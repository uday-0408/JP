import { setSingleCompany } from "@/redux/companySlice";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // ✅ Add this import
import { toast } from "sonner";

const useGetCompanyById = (companyId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Add this

  useEffect(() => {
    if (!companyId || companyId === "undefined") {
      return;
    }

    const fetchSingleCompany = async () => {
      try {
        const res = await axios.get(
          `${COMPANY_API_END_POINT}/get/${companyId}`,
          {
            withCredentials: true,
          }
        );
        console.log(res.data.company);
        if (res.data.success) {
          dispatch(setSingleCompany(res.data.company));
        }
      } catch (error) {
        console.log("error from useGetCompanyById hook: " + error);
        // ✅ Add the same error handling
        if (error.response?.status === 401) {
          console.warn("Unauthorized access, redirecting to login");
          toast.warning("LOgin to continue");
          navigate("/login");
        }
      }
    };

    fetchSingleCompany();
  }, [companyId, dispatch, navigate]); // ✅ Add navigate to dependencies
};

export default useGetCompanyById;
