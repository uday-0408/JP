import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser, setLoading } from "@/redux/authSlice";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const useAutoLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user}=useSelector(store=>store.auth)

  useEffect(() => {
    const autoLogin = async () => {
      try {
        dispatch(setLoading(true));

        const res = await axios.get(`${USER_API_END_POINT}/auto-login`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setUser(res.data.user));
          toast.success(res.data.message || "Auto-login successful!");
          navigate("/");
        }
      } catch (error) {
        console.error("❌ Auto-login failed:", error);
        toast.error(
          error?.response?.data?.message || "Session expired. Please log in."
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    if(user && user._id) {
      // User is already logged in, no need to auto-login
      return;
    }else{
      autoLogin();
    }
  }, [dispatch, navigate]);
};

export default useAutoLogin;
