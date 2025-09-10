import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { login } from '../../store/professionalSlice';
import LinkedInLogo from '@mui/icons-material/LinkedIn';

function LinkedInCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const code = new URLSearchParams(location.search).get('code');
  const dispatch = useDispatch();
  const baseUrl = "http://localhost:8001/usersOn";
  const [isLoading, setIsLoading] = useState(true);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4); // 0 to 3 dots
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sendCodeToBackend = () => {
    return axios.post(baseUrl + "/send_reddit_code", {
      code
    }, { withCredentials: true });
  };

 useEffect(() => {
  const fetchData = async () => {
    try {
      const responseReceived = await sendCodeToBackend();

      if (responseReceived.data.success) {
        const { user_id, user_email } = responseReceived.data.user;
        dispatch(login({ user_email, user_id }));
   
            navigate("/professional/dashboard");
        
      } else {
        toast.error(responseReceived.data.message || "An error occurred. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);


  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center"
    }}>
      {isLoading ? (
        <>
          <LinkedInLogo sx={{ color: '#1B56FD', fontSize: '40px', marginBottom: '10px' }} />
          <h4 style={{ fontWeight: 500 }}>
            Authenticating
            <span style={{
              display: 'inline-block',
              width: '1.5em',
              fontFamily: 'monospace'
            }}>
              {".".repeat(dotCount)}
            </span>
          </h4>
          <p>Verifying your Reddit credentials</p>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}

export default LinkedInCode;
