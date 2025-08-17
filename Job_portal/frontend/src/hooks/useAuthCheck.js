import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/authSlice';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const useAuthCheck = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('token');
    console.log("useAuthCheck token:", token);
  }, []);

  useEffect(() => {
    const token = getCookie('token');
    if (!user && !token) {
      navigate('/login');
    }
  }, [user, navigate]);
};

export default useAuthCheck;
