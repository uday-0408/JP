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
        console.log("🔄 Attempting auto-login...");

        const res = await axios.get(`${USER_API_END_POINT}/auto-login`, {
          withCredentials: true,
        });

        console.log("✅ Auto-login response:", res.data);
        
        if (res.data.success) {
          console.log("✅ Auto-login successful, setting user data:", res.data.user);
          // setUser will also set isAuthenticated to true in the Redux store
          dispatch(setUser(res.data.user));
          toast.success(res.data.message || "Auto-login successful!");
          navigate("/");
        }
      } catch (error) {
        console.error("❌ Auto-login failed:", error);
        console.error("❌ Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // Make sure user is null in case of auth failure
        dispatch(setUser(null)); // This will also set isAuthenticated to false
        
        toast.error(
          error?.response?.data?.message || "Session expired. Please log in."
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    if(user && user._id) {
      console.log("👤 User already logged in:", user._id);
      // User is already logged in, no need to auto-login
      return;
    } else {
      console.log("🔄 No user in store, attempting auto-login");
      autoLogin();
    }
  }, [dispatch, navigate, user]);
};

export default useAutoLogin;
