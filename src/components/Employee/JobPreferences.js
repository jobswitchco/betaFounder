import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogContent,
  AppBar,
  Slide,
  Toolbar,
  IconButton,
  FormLabel,
  RadioGroup,
  Stack,
  FormControlLabel,
  Radio,
  Grid,
  Select,
  MenuItem,
  Checkbox,
  ClickAwayListener,
  Menu,
  CircularProgress,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';
import HighlightAltOutlinedIcon from '@mui/icons-material/HighlightAltOutlined';

countries.registerLocale(enLocale);

const allCountries = Object.entries(
  countries.getNames("en", { select: "official" })
).map(([code, name]) => ({
  code,
  label: name,
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function JobPreferences() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedCities, setSelectedCities] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = React.useState({
    jobType: "Hybrid",
    companyType: "Any",
    mobileNumber: "",
    ctcFrom: "",
    ctcTo: "",
    currency: "INR",
  });

  const baseUrl = "http://localhost:8001/usersOn";

  const formatCTC = (amount, currency) => {
    if (currency === "INR") {
      return new Intl.NumberFormat("en-IN").format(amount);
    }
    return amount; // return as-is for other currencies
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        setLoading(true);
        const response = await axios.get(baseUrl + "/get-job-preferences",  {
          withCredentials: true
        
        });

        if (response.data.success) {
          setUserDetails(response.data.data);
        } else {
         
        }
      } catch (error) {
        toast.error("Network error. Please log in again.");
        setTimeout(() => navigate("/professional/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDialogClose = () => setIsDialogOpen(false);

  const handleDialogOpen = () => {
  populateFormData();
  setIsDialogOpen(true);
};


  const handleToggle = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleSelect = (cityId) => {
    setSelectedCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const populateFormData = () => {
  if (!userDetails) return;

  // Set form data fields that match your form structure
  setFormData({
    jobType: userDetails.pref_job_type || "Hybrid",
    companyType: userDetails.pref_company_type || "Any",
    mobileNumber: userDetails.mobile_number || "",
    ctcFrom: userDetails.expected_ctcFrom || "",
    ctcTo: userDetails.expected_ctcTo || "",
    currency: userDetails.currency || "INR",
  });

  // Set selected country from user's preferred job locations if available
  if (userDetails.pref_job_locations && userDetails.pref_job_locations.length > 0) {
    // Assuming all job locations belong to the same country
    const countryName = userDetails.pref_job_locations[0].country || null;

    // Find country object from allCountries array
    const countryObj = allCountries.find(c => c.label === countryName);

    if (countryObj) {
      setSelectedCountry(countryObj);

      // Fetch cities for that country and then set selected cities after fetching
      fetchJobLocations(countryObj).then(() => {
        // Extract city IDs from pref_job_locations to set selectedCities
        const cityIds = userDetails.pref_job_locations.map(loc => loc._id);
        setSelectedCities(cityIds);
      });
    }
  } else {
    setSelectedCountry(null);
    setSelectedCities([]);
  }
};


 const fetchJobLocations = async (country) => {
  try {
    const response = await axios.post(baseUrl + "/get_job_locations", {
      countryName: country.label,
      countryCode: country.code,
    });

    if (response.data.fetched) {
      setCities(response.data.cities || []);
    } else {
      setCities([]);
    }
    return response.data.cities || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    setCities([]);
    return [];
  }
};


const handleSave = async () => {
  const { jobType, companyType, mobileNumber, ctcFrom, ctcTo, currency } = formData;

  if (
    !jobType ||
    !companyType ||
    !mobileNumber ||
    !ctcFrom ||
    !ctcTo ||
    !currency ||
    (jobType === "Hybrid" && (!selectedCountry || selectedCities.length === 0))
  ) {
    toast.warning("All fields are mandatory.");
    return;
  }

  try {
    const response = await axios.post(
      baseUrl + "/save_job_preferences",
      { formData, selectedCities, selectedCountry },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      toast.success("Preferences Saved.");

      const updatedUserResponse = await axios.get(baseUrl + "/get-job-preferences", {
        withCredentials: true,
      });

      if (updatedUserResponse.data.success) {
        setUserDetails(updatedUserResponse.data.data);
        handleDialogClose();
      }
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
};


  const currencies = [
    { symbol: "₹", label: "INR" },
    { symbol: "$", label: "USD" },
    { symbol: "€", label: "EUR" },
    { symbol: "£", label: "GBP" },
    { symbol: "¥", label: "JPY" },
    { symbol: "₩", label: "KRW" },
    { symbol: "₽", label: "RUB" },
    { symbol: "C$", label: "CAD" },
    { symbol: "A$", label: "AUD" },
    { symbol: "S$", label: "SGD" },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          border: "1px solid grey",
          px: 2,
          py: 2,
          mt: 2,
          borderRadius: "8px",
        }}
      >
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >

           <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 1, alignItems : 'center'}}>
                            <HighlightAltOutlinedIcon sx={{ fontSize : '22px'}}/>
            <Typography
            sx={{ fontSize: "16px", fontWeight: 500, color: "#0D7C66" }}
          >
            Job preferences
          </Typography>
          
                          </Stack>

          <IconButton onClick={handleDialogOpen} size="small">
            <EditOutlinedIcon
              sx={{
                cursor: "pointer",
                fontSize: "20px",
                color: "#735557",
                ":hover": { color: "#261FB3" },
              }}
            />


          </IconButton>
        </Stack>

{ loading ? ( <Box
          sx={{
                         display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%', 
                          width: '100%',
                        }}
        >
          <CircularProgress />
        </Box>) : (
<>
  {/* Container for each row */}

  <Stack
    sx={{
      display: 'flex',
      flexDirection:  isMobile ? 'column' : 'row',
      gap: 1,
      alignItems: isMobile ? '' : 'center',
      mt: 1,
      mb: 1.5,
    }}
  >
    <Typography
      sx={{
        fontSize: isMobile ? '14px' : '15px',
        fontWeight: 500,
        minWidth: '130px',
      }}
    >
      Preferred CTC
    </Typography>

    <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
      <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 400 }}>
        {formatCTC(userDetails.expected_ctcFrom, userDetails.currency)}
      </Typography>

      <HorizontalRuleOutlinedIcon sx={{ fontSize: isMobile ? '14px' : '18px' }} />

      <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 400 }}>
        {formatCTC(userDetails.expected_ctcTo, userDetails.currency)} {userDetails.currency}
      </Typography>
    </Stack>
  </Stack>


   <Stack
    sx={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 1,
      mb: 1.5,
      alignItems: isMobile ? '' : 'center',
    }}
  >
    <Typography sx={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 500, minWidth: '130px' }}>
      Company Type
    </Typography>

     {userDetails.pref_company_type === 'Any' ? (
       <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 400 }}>MNC, StartUp</Typography>
     ) : (

      <Typography sx={{ fontSize: '16px', fontWeight: 400 }}>
        {userDetails.pref_company_type}
      </Typography>

     )}

    
  </Stack>

  
  <Stack
    sx={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 1,
      mb: 1.5,
      alignItems: isMobile ? '' : 'center',
    }}
  >
    <Typography sx={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 500, minWidth: '130px' }}>
      Job Type
    </Typography>

    <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 400 }}>
      {userDetails.pref_job_type}
    </Typography>
  </Stack>

 

  {(userDetails.pref_job_type === 'Hybrid') && (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 1,
        mb: 1.5,
        alignItems: isMobile ? '' : 'center',
        flexWrap: 'wrap',
      }}
    >
      <Typography sx={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 500, minWidth: '130px' }}>
        Job Locations
      </Typography>

      <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 1}}>

      


      {userDetails.pref_job_locations?.length > 0 &&
        userDetails.pref_job_locations.map((locs) => (
          <Box key={locs._id} sx={{ display: 'flex', flexDirection : 'row', mr: 1 }}>
            <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 400 }}>{locs.city}</Typography>
          </Box>
        ))}

        </Stack>

    </Stack>
  )}

  <Stack
    sx={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 1,
      mb: 1.5,
      alignItems: isMobile ? '' : 'center',
    }}
  >
    <Typography sx={{ fontSize: '15px', fontWeight: 500, minWidth: '130px' }}>
      Interview Alerts
    </Typography>

    <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 400 }}>+91 - {userDetails.mobile_number}</Typography>
  </Stack>

  <Stack
    sx={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 1,
      alignItems: isMobile ? '' : 'center',
    }}
  >
    <Typography sx={{ fontSize: '15px', fontWeight: 500, minWidth: '130px' }}>
      Email Alerts
    </Typography>

    <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 400 }}>{userDetails.email}</Typography>
  </Stack>
</>

)}


 
        
       

      </Box>

      <Dialog
        fullScreen
        open={isDialogOpen}
        onClose={handleDialogClose}
        TransitionComponent={Transition}
      >
        <AppBar
          position="relative"
          sx={{
            backgroundColor: "#fff",
            boxShadow: "none",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleDialogClose}
                aria-label="close"
              >
                <CloseIcon sx={{ color: "#000" }} />
              </IconButton>
            </Stack>

            <Button
              onClick={handleSave}
              color="success"
              sx={{
                borderRadius: "18px",
                backgroundColor: "#3A59D1",
                color: "#FFFFFF",
                px: 3,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#5b9f61",
                },
              }}
            >
              Save
            </Button>
          </Toolbar>
        </AppBar>

        <DialogContent dividers sx={{ px: isMobile ? 4 : 9, pt: 0 }}>
          <Typography
            sx={{ marginTop: "12px", fontSize: "16px", fontWeight: 500 }}
            gutterBottom
          >
            Job Preferences
          </Typography>
          <Typography
            sx={{ marginTop: "12px", fontSize: "14px", color: "grey" }}
            mb={2}
          >
            Details like expected salary, job type, etc, help right employers to
            offer a job.
          </Typography>

          <Grid item xs={12}>
            {/* Company type */}
            <FormLabel
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#000000",
                marginTop: "12px",
              }}
            >
              Company Type
            </FormLabel>
            <RadioGroup
              row
              name="companyType"
              value={formData.companyType}
              onChange={handleChange}
              sx={{ gap: isMobile ? 1 : 5 }}
            >
              <FormControlLabel
                value="Any"
                control={
                  <Radio
                    sx={{ color: "black", "&.Mui-checked": { color: "black" } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "black" }}>
                    Any
                  </Typography>
                }
              />

              <FormControlLabel
                value="MNC"
                control={
                  <Radio
                    sx={{ color: "black", "&.Mui-checked": { color: "black" } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "black" }}>
                    MNC
                  </Typography>
                }
              />
              <FormControlLabel
                value="StartUp"
                control={
                  <Radio
                    sx={{ color: "black", "&.Mui-checked": { color: "black" } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "black" }}>
                    Startup
                  </Typography>
                }
              />
            </RadioGroup>
          </Grid>
          {/* Employment type */}
          <FormLabel
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#000000",
              marginTop: "22px",
            }}
          >
            Job Type
          </FormLabel>
          <RadioGroup
            row
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            sx={{ gap: isMobile ? 1 : 5 }}
          >
            <FormControlLabel
              value="Hybrid"
              control={
                <Radio
                  sx={{ color: "black", "&.Mui-checked": { color: "black" } }}
                />
              }
              label={
                <Typography sx={{ fontSize: "14px", color: "black" }}>
                  Hybrid
                </Typography>
              }
            />
            <FormControlLabel
              value="Remote"
              control={
                <Radio
                  sx={{ color: "black", "&.Mui-checked": { color: "black" } }}
                />
              }
              label={
                <Typography sx={{ fontSize: "14px", color: "black" }}>
                  Remote
                </Typography>
              }
            />
          </RadioGroup>

          {/* Grid section */}
          <Grid container spacing={2} mb={4}>
            {formData.jobType === "Hybrid" && (
              <>
                {/* Country Selection */}
                <Grid item xs={12} mt={2}>
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}
                  >
                    Select Country
                  </Typography>
                 <Autocomplete
                  options={allCountries}
                  getOptionLabel={(option) => option.label}
                  value={selectedCountry}
                  onChange={(event, newValue) => {
                    setSelectedCountry(newValue);
                    if (newValue) fetchJobLocations(newValue);
                    setSelectedCities([]); // reset cities when country changes
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select a country" />
                  )}
                />

                </Grid>

                {/* Show cities if country is selected */}
                {selectedCountry && (
                  <Grid item xs={12} mt={2}>
                    <Typography
                      sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}
                    >
                      Preferred Job Locations
                    </Typography>

                    <ClickAwayListener onClickAway={handleClose}>
                      <Box>
                   <TextField
                    label={!selectedCities.length ? "Select Cities" : ""}
                    value={selectedCities
                      .map((id) => {
                        const match = cities.find((city) => city._id === id);
                        return match ? match.city : "";
                      })
                      .filter(Boolean)
                      .join(", ")}
                    onClick={handleToggle}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ cursor: "pointer", mt: 1 }}
                  />


                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                          PaperProps={{
                            style: {
                              maxHeight: 200,
                              width: 250,
                              padding: "0.5rem",
                            },
                          }}
                        >
                          {cities.map((city) => (
                            <MenuItem
                              key={city._id}
                              onClick={() => handleSelect(city._id)}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedCities.includes(city._id)}
                                  />
                                }
                                label={city.city}
                              />
                            </MenuItem>
                          ))}
                        </Menu>
                      </Box>
                    </ClickAwayListener>
                  </Grid>
                )}
              </>
            )}


            {/* Expected CTC */}

            {isMobile ? (
                <Grid item xs={12} mt={1}>
              <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 1 }}>
                Expected CTC Range (INR)
              </Typography>
              <Box sx={{ display: "flex", flexDirection : 'column'}}>
                
                <Select
                  value={formData.currency || "INR"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  displayEmpty
                  variant="outlined"
                  sx={{ minWidth: 80, height: "100%", fontSize: "14px", mb: 1 }}
                >
                  {currencies.map((curr) => (
                    <MenuItem key={curr.label} value={curr.label}>
                      {curr.label}
                    </MenuItem>
                  ))}
                </Select>

                <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 1, alignItems : 'center'}}>

                   <TextField
                  label={!formData.ctcFrom ? "From : eg., 12,00,000" : ""}
                  name="ctcFrom"
                  type="number"
                  value={formData.ctcFrom}
                  onChange={handleChange}
                  fullWidth
                  sx={{ flex: 1 }}
                  slotProps={{
                    inputLabel: {
                      sx: {
                        fontSize: "14px",
                        "&.Mui-focused": { display: "none" },
                        display: "block",
                      },
                      shrink: false,
                    },
                  }}
                />


               <HorizontalRuleOutlinedIcon sx={{ fontSize : '12px'}} />

                 <TextField
                  label={!formData.ctcTo ? "To : eg., 18,00,000" : ""}
                  name="ctcTo"
                  type="number"
                  value={formData.ctcTo}
                  onChange={handleChange}
                  fullWidth
                  sx={{ flex: 1 }}
                  slotProps={{
                    inputLabel: {
                      sx: {
                        fontSize: "14px",
                        "&.Mui-focused": { display: "none" },
                        display: "block",
                      },
                      shrink: false,
                    },
                  }}
                />

                </Stack>

               
              </Box>
            </Grid>
            ) : (
                <Grid item xs={12} mt={1}>
              <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 1 }}>
                Expected CTC Range
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Select
                  value={formData.currency || "INR"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  displayEmpty
                  variant="outlined"
                  sx={{ minWidth: 80, height: "100%", fontSize: "14px" }}
                >
                  {currencies.map((curr) => (
                    <MenuItem key={curr.label} value={curr.label}>
                      {curr.label}
                    </MenuItem>
                  ))}
                </Select>

                <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 1, alignItems : 'center'}}>

                   <TextField
                  label={!formData.ctcFrom ? "From : eg., 12,00,000" : ""}
                  name="ctcFrom"
                  type="number"
                  value={formData.ctcFrom}
                  onChange={handleChange}
                  fullWidth
                  sx={{ flex: 1 }}
                  slotProps={{
                    inputLabel: {
                      sx: {
                        fontSize: "14px",
                        "&.Mui-focused": { display: "none" },
                        display: "block",
                      },
                      shrink: false,
                    },
                  }}
                />


               <HorizontalRuleOutlinedIcon sx={{ fontSize : '20px'}} />

                 <TextField
                  label={!formData.ctcTo ? "To : eg., 18,00,000" : ""}
                  name="ctcTo"
                  type="number"
                  value={formData.ctcTo}
                  onChange={handleChange}
                  fullWidth
                  sx={{ flex: 1 }}
                  slotProps={{
                    inputLabel: {
                      sx: {
                        fontSize: "14px",
                        "&.Mui-focused": { display: "none" },
                        display: "block",
                      },
                      shrink: false,
                    },
                  }}
                />

                </Stack>

               
              </Box>
            </Grid>
            )}
          

            <Grid item xs={12} mt={1}>
              <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                For Interview Schedules
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "grey", mb: 2 }}>
                Enter your mobile number to receive SMS alerts for scheduled
                interviews in case you miss or check emails late.
              </Typography>

              <TextField
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    setFormData((prev) => ({
                      ...prev,
                      mobileNumber: value,
                    }));
                  }
                }}
                required
                fullWidth
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+91</InputAdornment>
                  ),
                }}
                slotProps={{
                  inputLabel: {
                    sx: {
                      fontSize: "14px",
                      "&.Mui-focused": { display: "none" },
                      display: "block",
                    },
                    shrink: false,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

    </>
  );
}

export default JobPreferences;
