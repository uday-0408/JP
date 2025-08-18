import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';

/**
 * This hook verifies the authentication state before trying to use protected APIs.
 * It ensures that:
 * 1. We check if the user is logged in but the Redux state doesn't reflect that
 * 2. If a token is present but user state is missing, it tries to reload the user data
 * 
 * @returns {Object} { verifyAuth, isVerifying } - Function to verify auth and loading state
 */
const useAuthVerifier = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Function to verify authentication before protected operations
  const verifyAuth = async () => {
    // If we're already authenticated with a user object, no need to verify
    if (isAuthenticated && user) {
      return true;
    }
    
    setIsVerifying(true);
    
    try {
      // Check if we have a cookie even if Redux says we're not authenticated
      const cookiesExist = document.cookie
        .split(';')
        .some(c => c.trim().startsWith('token='));
      
      if (!cookiesExist) {
        console.log("🔒 No auth cookies found");
        return false;
      }
      
      console.log("🔄 Verifying authentication state...");
      
      // We have a cookie but no user, try to auto-login
      try {
        const response = await axios.get(`${USER_API_END_POINT}/auto-login`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          console.log("✅ Auth verification successful - User logged in");
          dispatch(setUser(response.data.user));
          return true;
        } else {
          console.log("❌ Auto-login response indicates failure:", response.data);
          return false;
        }
      } catch (autoLoginError) {
        console.error("❌ Auto-login request failed:", autoLoginError);
        return false;
      }
    } catch (error) {
      console.error("❌ Auth verification failed:", error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  return { verifyAuth, isVerifying };
};

export default useAuthVerifier;
