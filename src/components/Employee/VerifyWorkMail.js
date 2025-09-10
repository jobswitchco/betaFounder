import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from '../../images/desk-logo.svg'
import { logout } from "../../store/professionalSlice";
import { useDispatch } from "react-redux";


function UserSignup() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [fetchedEmail, setFetchedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [errorMessage, setErrorMessage] = useState("");
  const baseUrl = "http://localhost:8001/usersOn";

  const handleClickAway = () => {
    //this function keeps the dialogue open, even when user clicks outside the dialogue. dont delete this function
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const disallowedDomains = ["gmail.com", "yahoo.com"];

const handleEmailChange = (e) => {
  const value = e.target.value;
  setEmail(value);

  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!value) {
    setErrorMessage("Email is required.");
  } else if (!emailRegex.test(value)) {
    setErrorMessage("Invalid email");
  } else {
    const domain = value.split("@")[1];
    if (disallowedDomains.includes(domain)) {
      setErrorMessage("Public email domains like Gmail/Yahoo are not allowed.");
    } else {
      setErrorMessage(""); // Valid input
    }
  }
};

useEffect(() => {
  async function verifyLoginToken() {
    try {
      setIsLoading(true);

      // Step 1: Verify token
      const res = await axios.get(`${baseUrl}/verify-login-token`, { withCredentials: true });

      if (res.data.valid) {
        setFetchedEmail(res.data.user.user_email);

      } else {
        setIsLoading(false);
        toast.error("Session expired. Please log in again.");
        setTimeout(() => navigate("/professional/login"), 2000);
      }
    } catch (error) {
      setIsLoading(false);
      if ([401, 400, 403].includes(error.response?.status)) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Network Error. Please log in again.");
      }
      setTimeout(() => navigate("/professional/login"), 2000);
    } finally {
      setIsLoading(false);
    }
  }

  verifyLoginToken();
}, []);


 const handleSignOut = async () => {
        try {
            await axios.post(baseUrl + "/logout", {}, { withCredentials: true });
            dispatch(logout()); // Clear Redux state
            window.location.href = "/professional/login"; // Ensures full logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };




async function submit(e) {
  e.preventDefault();

  // If errorMessage exists, don't proceed
  if (errorMessage || !email) {
    setErrorMessage(errorMessage || "Email is required.");
    return;
  }

  setIsLoading(true);

  try {
    const response = await axios.post(
      baseUrl + "/verify_work_mail",
      { email },
      { withCredentials: true }
    );

    if (response.data.valid) {
      setIsLoading(false);
      setIsDialogOpen(true);
    } else {
      setIsLoading(false);
      setErrorMessage("Invalid Email Address.");
    }
  } catch (error) {
    setIsLoading(false);
    setErrorMessage("Technical error. Please try again later.");
  }
}

  const checkPin = async (e) => {
    e.preventDefault();

    if (!emailCode) {
      toast.warning("Enter valid 6-digit Pin");
    } else {
      await axios
        .post(
          baseUrl + "/check-verify-pin-professional",
          { pin: emailCode },
          { withCredentials: true }
        )
        .then((res) => {

          setIsLoading(true);

          if (!res.data.matching) {
            setIsLoading(false);
            toast.error("Invalid Pin");
          } else if (res.data.matching) {
            setIsLoading(false);
            setIsDialogOpen(false);
            toast.success(
              "Email verified successfully."
            );

            setTimeout(() => {
              navigate("/professional/career_details");
            }, 2000);
          }
        })
        .catch((err) => {
          if (
            err.response &&
            err.response.data.error === "User does not exists!"
          ) {
            toast.warning("User does not exists");
          } else if (
            err.response &&
            err.response.data.error === "email, password mismatch"
          ) {
            toast.warning("Invalid email or password");
          } else {
            toast.error("An error occurred. Please try again later.");
          }
        });
    }
  };


  return (
    <>
      {/* <Grid container spacing='2'> */}

      {isSmallScreen ? (
        <Grid item xs={12} paddingX={2}>
          <form action="#" method="post">
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                  marginTop: "30%",

                }}
              >
                <CircularProgress color="success" />
              </div>
            ) : (
              <>

<Box sx={{display : 'flex', justifyContent : 'space-between', mt: 3, alignItems : 'center'}}>

<a href="/">
           <img className="img-fluid" src={logo} alt="newrole" width={110} />
         </a>

<Box sx={{ display : 'flex', px: 2, py: '2px', alignItems : 'center', ":hover": { border: " 1px solid #D6D6D6", borderRadius : 5, cursor : 'pointer', color: 'EEEEEE' }
}} onClick={handleSignOut}>
<Typography sx={{ fontSize : '15px', color: 'grey', ":hover" : { color : '#000000'}}}>Logout</Typography>
</Box>

</Box>


                  <Box
                    display="flex"
                    flexDirection={"column"}
                    margin="auto"
                    marginTop={5}
                    
                  >
                    <Typography textAlign="center" sx={{ fontSize : '18px', fontWeight : 400, marginBottom : '18px'}}>
                    🔒 Verify Identity
                    </Typography>

                    <Typography sx={{ fontSize : '15px', color : '#3C3D37'}}>
                    This is a <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>one-time</span> verification process to confirm that you're a <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>working professional.</span>
                    Your work email will <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500, textDecoration : 'underline'}}>never</span> be shared with your current or future employer, or used for any marketing or promotional purposes.
                    </Typography>


                    <Typography sx={{ fontSize : '15px', color : '#3C3D37', mt: 2}}>
                    We ask for this step to maintain a <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>trusted and authentic community</span> of professionals on this platform — ensuring that every listing and profile is <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>real</span>, <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>verified</span>, and <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>safe.</span>
                    </Typography>



{/* <div style={{ display : 'flex', alignItems : 'center', marginTop : '36px'}}> */}

<TextField
  type="email"
  id="email"
  value={email}
  onChange={handleEmailChange}
  variant="outlined"
  label="Work Email"
  error={Boolean(errorMessage)}
  sx={{
    mt: 4,
    minWidth: "280px",
    maxWidth: "400px",
    width: "100%",
    marginRight: 2,
    '& .MuiOutlinedInput-root': {
      height: '56px', // Standard height for proper label float
      borderRadius: '32px',
    },
    '& .MuiInputLabel-root': {
      lineHeight: '1.2',
    }
  }}
/>


{errorMessage && (
                      <p style={{ color: "red", fontSize : '12px', marginTop : '6px', marginLeft : '4px', marginBottom : '6px'}}>{errorMessage}</p>
                    )}

<Button
    type="submit"
    onClick={submit}
    variant="outlined"
    size="large"
    sx={{
      height: "46px", // Match TextField height
      textTransform: "capitalize",
      fontWeight: 400,
      fontSize: 16,
      px: 4,
      mt: 1,
      borderRadius: '32px',
      borderColor: "#362FD9",
      color: '#362FD9',
      ":hover": { background: '#362FD9', color: '#FFFFFF' }
    }}
  >
    Verify Now
  </Button>

  <Typography sx={{ fontSize : '15px', color : '#3C3D37', mt: 3, mb: 6}}>
From here on <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>all communications</span> such as interview schedules, profile updates, or job-related notifications will be sent to your personal email <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>{fetchedEmail}&nbsp;</span>
 <br /> —so you stay informed, privately and securely.
                    </Typography>



{/* </div> */}

                   

                
                  </Box>
              </>
            )}

          </form>
        </Grid>
        
      ) : (

        <>

        <Box sx={{display : 'flex', justifyContent : 'space-between', px: 8, mt: 5, alignItems : 'center'}}>

             <a href="/">
                        <img className="img-fluid" src={logo} alt="newrole" width={120} />
                      </a>

          <Box onClick={handleSignOut} sx={{ display : 'flex', px: 2, py: '2px', alignItems : 'center', ":hover": { border: " 1px solid #D6D6D6", borderRadius : 5, cursor : 'pointer', color: 'EEEEEE' }
           }}>
          <Typography sx={{ fontSize : '15px', color: 'grey', ":hover" : { color : '#000000'}}}>Logout</Typography>
          </Box>
          
        </Box>
        <Grid container >

          <Grid item xs={12}>
            <form action="#" method="post">
              {isLoading ? (
                 <div
                 style={{
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   height: "100%",
                   width: "100%",
                   marginTop: "30%",
 
                 }}
               >
                 <CircularProgress color="success" />
               </div>
              ) : (
                <>
                  <Box
                    display="flex"
                    flexDirection={"column"}
                    maxWidth={660}
                    margin="auto"
                    marginTop={1}
                    
                  >
                    <Typography variant="h5" padding={3} textAlign="center">
                    🔒 Verify Identity
                    </Typography>

                    <Typography sx={{ fontSize : '16px', color : '#3C3D37', mt: 2}}>
                    This is a <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>one-time</span> verification process to confirm that you're a <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>working professional.</span>
                    Your work email will <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500, textDecoration : 'underline'}}>never</span> be shared with your current or future employer, or used for any marketing or promotional purposes.
                    </Typography>


                    <Typography sx={{ fontSize : '16px', color : '#3C3D37', mt: 2}}>
                    We ask for this step to maintain a <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>trusted and authentic community</span> of professionals on this platform — ensuring that every listing and profile is <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>real</span>, <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>verified</span>, and <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>safe.</span>
                    </Typography>



<div style={{ display : 'flex', alignItems : 'center', marginTop : '36px'}}>


<TextField
    type="email"
    id="email"
    value={email}
    onChange={handleEmailChange}
    variant="outlined"
    label="Work Email"
    error={Boolean(errorMessage)}
    sx={{
      minWidth: "300px",
      maxWidth: "400px",
      width: "100%",
      height: "56px", // Match button height
      marginRight: 2,
      '& .MuiOutlinedInput-root': {
        height: "56px", // Apply consistent height
        borderRadius: '32px',
        paddingRight: 0
      },
    
    }}
  />



<Button
    type="submit"
    onClick={submit}
    variant="outlined"
    size="large"
    sx={{
      height: "56px", // Match TextField height
      textTransform: "capitalize",
      fontWeight: 400,
      fontSize: 16,
      px: 4,
      borderRadius: '32px',
      borderColor: "#362FD9",
      color: '#362FD9',
      ":hover": { background: '#362FD9', color: '#FFFFFF' }
    }}
  >
    Verify Now
  </Button>

</div>

{errorMessage && (
                      <p style={{ color: "red", fontSize : '12px', marginLeft : '14px', marginTop : '4px'}}>{errorMessage}</p>
                    )}

<Typography sx={{ fontSize : '16px', color : '#3C3D37', mt: 14}}>
From here on <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>all communications</span> such as interview schedules, profile updates, or job-related notifications will be sent to your personal email <span style={{ display : 'inline-block', color : '#000000', fontWeight : 500}}>{fetchedEmail}&nbsp;</span>
 <br /> —so you stay informed, privately and securely.
                    </Typography>

                   

                
                  </Box>
                </>
              )}

            </form>
          </Grid>
        </Grid>

        </>
      )}

      {email && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Dialog
            open={isDialogOpen}
            onClose={handleDialogClose}
            disableEscapeKeyDown
            keepMounted
          >
            <DialogTitle>Verify Email</DialogTitle>
            <DialogContent dividers>
              <Typography sx={{ fontSize: "16px", marginTop: "5px" }}>
                Please enter 6-digit code which was sent to {email}
              </Typography>

              <TextField
                type="email"
                id="email"
                onChange={(e) => {
                  setEmailCode(e.target.value);
                }}
                margin="normal"
                variant="outlined"
                label="6-digit code"
                value={emailCode}
              ></TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDialogOpen(false)} color="primary" sx={{ textTransform : 'none'}}>
                Cancel
              </Button>
              <Button color="success" onClick={checkPin} sx={{ borderRadius : '18px', backgroundColor : '#67AE6E', color : '#FFFFFF', px: 3, textTransform : 'none'}}>
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </ClickAwayListener>
      )}
    </>
  );
}

export default UserSignup;
