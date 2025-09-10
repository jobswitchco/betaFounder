import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
    FormControlLabel,
    RadioGroup,
    Radio,
    FormLabel,
    Tooltip,
    Select,
    IconButton,
    AppBar,
    Slide,
    Toolbar,
DialogContentText,
CircularProgress,
Menu
  } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SkillsComp from "./SkillsComp";
import JobPreferences from "./JobPreferences";
import UANDetails from "./UANDetails";
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import JobRoleSelector from "./JobRoleSelector";
import Certifications from "./Certifications";
import ProjectsWorked from "./ProjectsWorked";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


function CareerDetails() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const baseUrl = "http://localhost:8001/usersOn";
      // const baseUrl="/api/usersOn";

  const [ loading, setLoading ] = useState(false);
  const [ userDetails, setUserDetails ] = useState({});
  const [currEmpTrue, setCurrEmpTrue] = useState(false);
  const [isNameEditDialogOpen, setIsNameEditDialogOpen] = useState(false);
const [editApName, setEditApName] = useState('');
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
const [editingEmploymentId, setEditingEmploymentId] = useState(null);

  


  
    const currentYear = new Date().getFullYear();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const handleOpenNameEditDialog = () => {
  setEditApName(userDetails.applicantName || '');
  setIsNameEditDialogOpen(true);
};

  const handleClose = () => {
    setAnchorEl(null);
  };

const handleCloseNameEditDialog = () => {
  setIsNameEditDialogOpen(false);
};


 const handleSaveNameEdit = async () => {
    try {
      const response = await axios.post(
        baseUrl + '/update_anonymous_name',
        {editApName},
        { withCredentials: true }
      );

      if(response.data.success){

                handleCloseNameEditDialog();
              toast.success("Name updated successfully.");

       const updatedUserResponse = await axios.post(baseUrl + '/get-user-details', {}, { withCredentials: true });
              
              if (updatedUserResponse.data.success) {
                setUserDetails(updatedUserResponse.data.data);
              }

      }


    } catch (error) {
              toast.error("Error! Please try again.");

    }
  };

  const handleEditEmployment = (emp) => {
  setFormData({
    isCurrentEmployment: emp.isCurrentEmployment,
    employmentType: emp.employmentType || '',
    totalExperienceYears: emp.totalExperienceYears || '',
    totalExperienceMonths: emp.totalExperienceMonths || '',
    companyName: emp.companyName || '',
    hideCurrentCompany: emp.hideCurrentCompany || false,
    jobRoleId: emp.jobRoleId?._id || '',
    fromYear: emp.fromYear || '',
    fromMonth: emp.fromMonth || '',
    toYear: emp.toYear || '',
    toMonth: emp.toMonth || '',
    ctc: emp.ctc || 0,
    currency: emp.currency || 'INR',
    noticePeriod: emp.noticePeriod || '',
    workLocation: emp.workLocation?._id || '',  
  });

  setSelectedCity(emp.workLocation?._id || '');
  setEditingEmploymentId(emp._id);
  setIsEditMode(true);
  setIsEditDialogOpen(true);
};




  


    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const [selectedEmploymentId, setSelectedEmploymentId] = useState(null);

    const formatCTC = (amount, currency) => {
      if (currency === 'INR') {
        return new Intl.NumberFormat('en-IN').format(amount);
      }
      return amount;
    };
    

  
  
      const handleSessionExpired = () => {
          toast.error("Session expired. Please log in again.");
          setTimeout(() => {

            navigate('/professional/login');
            
          }, 1500);
        };


  
  
  
       useEffect(() => {
          const verifyToken = async () => {
            setLoading(true);
          
            try {
              const res = await axios.get(`${baseUrl}/verify-login-token`, { withCredentials: true });
          
              if (res.data.valid) {
                await fetchData();
              } else {
                handleSessionExpired();
              }
            } catch (error) {
              if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                handleSessionExpired();
              } else {
                toast.error("Network error, please try again later.");
              }
            } finally {
              setLoading(false);
            }
          };
          
      
          verifyToken();
        }, []);
  
           const fetchData = async () => {
                    try {

                            await axios.post(baseUrl + "/get-user-details", { }, { withCredentials : true}).then(ress=>{
        
                              if(ress.data.success){
                                setUserDetails(ress.data.data);
                                const hasCurrentEmployment = ress.data.data.employmentDetails.some((curr) => curr.isCurrentEmployment);
                                setCurrEmpTrue(hasCurrentEmployment);
                                setLoading(false);

                              }
                              else {
                                setLoading(false);
                                toast.error("Session expired. Please log in again.");
                                setTimeout(() => {
                                navigate('/professional/login');
                                }, 2000);
                              }
                    
                        }).catch(e=>{
                    
                        })
                    
                    } catch (error) {
                      setLoading(false);
                      toast.error("Network error. Please log in again.");
                      setTimeout(() => {
                      navigate('/professional/login');
                      }, 2000);
                    }
                  };

                  useEffect(() => {
                    if (userDetails && Object.keys(userDetails).length > 0) {
                      setFormData(prev => ({
                        ...prev,
                        isCurrentEmployment: userDetails?.employmentDetails?.isCurrentEmployment
                      }));
                    }
                  }, [userDetails]);
                  

                    
    const [formData, setFormData] = React.useState({
      isCurrentEmployment: userDetails?.employmentDetails?.isCurrentEmployment,
      employmentType: 'Full-time',
      totalExperienceYears: '',
      totalExperienceMonths: '',
      companyName: '',
      hideCurrentCompany: false,
      jobRoleId: '',
      fromYear: '',
      fromMonth: '',
      toYear: '',
      toMonth: '',
      ctc: 0,
      currency: 'INR',
      noticePeriod: '',
      workLocation: ''
    });


  const handleSelect = (cityId) => {
  setSelectedCity(cityId);
   setFormData((prev) => ({ ...prev, workLocation: cityId }));
  handleClose(); 
};


    const handleOpenDialog = (employmentId) => {
      setSelectedEmploymentId(employmentId);
      setOpenDeleteDialog(true);
    };
    
    const handleCloseDialog = () => {
      setOpenDeleteDialog(false);
      setSelectedEmploymentId(null);
    };
    
    

  function getTotalDuration(fromMonth, fromYear, toMonth, toYear, isCurrent) {
  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  // Handle edge cases: missing or invalid fromMonth or fromYear
  if (!fromMonth || !fromYear || !monthMap.hasOwnProperty(fromMonth)) return "N/A";

  const fromDate = new Date(fromYear, monthMap[fromMonth]);

  // If it's a current employment OR toMonth/toYear is missing/invalid, use current date
  const isToDateInvalid =
    isCurrent ||
    !toMonth ||
    !toYear ||
    !monthMap.hasOwnProperty(toMonth);

  const endDate = isToDateInvalid ? new Date() : new Date(toYear, monthMap[toMonth]);

  // Calculate total months
  let totalMonths =
    (endDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (endDate.getMonth() - fromDate.getMonth());

  // Prevent negative durations
  totalMonths = Math.max(0, totalMonths);

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearStr = years > 0 ? `${years} Year${years > 1 ? "s" : ""}` : "";
  const monthStr = months > 0 ? `${months} Month${months > 1 ? "s" : ""}` : "";

  return [yearStr, monthStr].filter(Boolean).join(" ") || "0 month";
}

    
  const hasEmployment = userDetails?.employmentDetails?.length > 0;
              

const years = Array.from({ length: 16 }, (_, i) => currentYear - i);

    
 const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  
  const handleEditDialogOpen = () => {
    setIsEditDialogOpen(true);
  };

   const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
  };

  
 

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = async (event) => {
  setAnchorEl(anchorEl ? null : event.currentTarget);
  if (cities.length === 0) {
    await fetchJobLocations();
  }
};




const handleSave = async () => {
  // Base required fields
  const requiredFields = [
    'employmentType',
    'companyName',
    'jobRoleId',
    'fromYear',
    'fromMonth',
    'workLocation'
  ];

  // Add ctc and noticePeriod only if isCurrentEmployment is true
  if (formData.isCurrentEmployment) {
    requiredFields.push('ctc', 'noticePeriod');
  }

  // Validate
  for (const field of requiredFields) {
    if (
      formData[field] === undefined ||
      formData[field] === '' ||
      formData[field] === null ||
      (typeof formData[field] === 'number' && isNaN(formData[field]))
    ) {
      toast.warning('All fields are mandatory');
      return;
    }
  }

  try {
    const response = await axios.post(
      baseUrl + '/save_employment_details',
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.saved) {
      await fetchData();
      handleDialogClose();
      toast.success('Employment Saved');
      setFormData({
        employmentType: '',
        companyName: '',
        jobRoleId: '',
        fromYear: '',
        fromMonth: '',
        toYear: '',
        toMonth: '',
        ctc: '',
        currency: 'INR',
        noticePeriod: '',
        workLocation: '',
      });

    } else {
      handleDialogClose();
      toast.error('Error! Please try again');
    }
  } catch (error) {
    handleDialogClose();
    toast.error('Error! Please try again');
  }
};


const handleUpdateEmpDetails = async () => {
  const {
    employmentType,
    companyName,
    jobRoleId,
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    ctc,
    noticePeriod,
    workLocation,
    isCurrentEmployment,
  } = formData;

  // Shared required fields
  const commonFields = [
    employmentType,
    companyName,
    jobRoleId,
    fromYear,
    fromMonth,
    workLocation,
  ];

  if (commonFields.some(field => field === undefined || field === '' || field === null)) {
    toast.warning('All fields are mandatory');
    return;
  }


  try {
    const response = await axios.post(
      baseUrl + '/update_employment_details',
      {
        employment_id: editingEmploymentId,
        ...formData,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );


    if (response.data.saved) {
      await fetchData();
      handleEditDialogClose();
      toast.success('Employment Updated');
      setFormData({
        employmentType: '',
        companyName: '',
        jobRoleId: '',
        fromYear: '',
        fromMonth: '',
        toYear: '',
        toMonth: '',
        isCurrentEmployment: true,
        ctc: '',
        currency: 'INR',
        noticePeriod: '',
        workLocation: '',
      });

    } else {
      toast.error('Error! Please try again');
    }
  } catch (error) {
    handleEditDialogClose();
    toast.error('Error! Please try again');
  }
};





  const handleConfirmDelete = async () => {
    try {
      const response = await axios.post(
        baseUrl + '/delete_employment_details',
        { employment_id: selectedEmploymentId },
        { withCredentials: true }
      );
      if(response.data.deleted){

                await fetchData();
       toast.success('Employment Deleted');

      }

      else{

       toast.success('Server Error. Please try again');

      }
      // optionally update UI
    } catch (error) {
       toast.success('Server Error. Please try again');

    } finally {
      handleCloseDialog();
    }
  };
  

  const fetchJobLocations = async () => {
    try {
      const response = await axios.post(baseUrl + "/get_job_locations", {
        countryCode: 'IN',
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

  const currencies = [
    { symbol: '₹', label: 'INR' },
    { symbol: '$', label: 'USD' },
    { symbol: '€', label: 'EUR' },
    { symbol: '£', label: 'GBP' },
    { symbol: '¥', label: 'JPY' },
    { symbol: '₩', label: 'KRW' },
    { symbol: '₽', label: 'RUB' },
    { symbol: 'C$', label: 'CAD' },
    { symbol: 'A$', label: 'AUD' },
    { symbol: 'S$', label: 'SGD' },
  ];
  







  return (
    <>
     
      <Grid container>
        {/* <Grid item xs={12} md={4}></Grid> */}

        { loading ? ( <Box
                  sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999
                  }}
                >
                  <CircularProgress />
                </Box>) : (

        <Grid xs={12} md={12} sx={{ pb: 2, mt: isSmallScreen ? 0 : 5, px: isSmallScreen ? 0 : 8}}>
        
          <Box>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>

              <Stack sx={{ display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontSize: isSmallScreen ? "16px" : "20px" }}>{userDetails.applicantName}</Typography>
                  <CreateOutlinedIcon
                    sx={{ fontSize: isSmallScreen ? "16px" : "20px", cursor: "pointer" }}
                    onClick={handleOpenNameEditDialog}
                  />
                </Box>
                <Typography sx={{ fontSize: isSmallScreen ? "13px" : "14px", fontWeight: 300, color: "grey" }}>
                 Recruiters see this name. It's editable.
                </Typography>
              </Stack>
            </Box>

            <Divider
              fullWidth
              sx={{
                borderBottomWidth: 2,
                borderColor: "#ccc",
                my: 2,
                width: isSmallScreen ? "100%" : "75%",
              }}
            />
          </Box>

          <div >
            
          
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                border: "1px solid grey",
                px: 2,
                py: 1,
                borderRadius : '8px'
              }}
            >
              <Stack sx={{ mt: 2, mb:2}}>

                <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 1, alignItems : 'center'}}>
                  <BadgeOutlinedIcon sx={{ fontSize : '22px'}}/>
              <Typography sx={{ fontSize : '16px', fontWeight : 500, color : '#4535C1'}}>Employment</Typography>


                </Stack>


                 {/* Fetched Employment Details  */}
                 {userDetails?.employmentDetails
  ?.slice()
  .sort((a, b) => (b.isCurrentEmployment === true) - (a.isCurrentEmployment === true))
  .map((emp, index) => (
    <Box key={emp._id || index} sx={{ mt: 2, mb: 1 }}>
      <Stack direction="row" alignItems="center" sx={{ alignItems : 'center'}}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>
          {emp.jobRoleId.name}
        </Typography>
        <IconButton
  onClick={() => emp._id && handleOpenDialog(emp._id)}
  size="small" 
  sx={{ ml: 1}}
>
  <DeleteOutlineOutlinedIcon sx={{ fontSize: '18px' }} />
</IconButton>

  <IconButton
  onClick={() => handleEditEmployment(emp)}
  size="small"
>
  <EditOutlinedIcon sx={{ fontSize: '18px', ml: 0.5}} />
</IconButton>


      </Stack>



      <Stack sx={{ display : 'flex', flexDirection : 'row', gap : 1}}>

         <Typography sx={{ fontSize: isSmallScreen ? '15px' : '16px', fontWeight: 400, mt: '4px' }}>
        {emp.companyName}
      </Typography>

  <Divider orientation="vertical" flexItem/>


       <Typography sx={{ fontSize: isSmallScreen ? '15px' : '16px', fontWeight: 400, mt: '4px' }}>
        {emp.workLocation.city}
      </Typography>

      </Stack>

     



      {isSmallScreen ? (
        <>
         <Stack direction="row" mt="6px" gap={1}>

      <Typography sx={{ fontSize: isSmallScreen ? '15px' : '16px', fontWeight: 400 }}>
    {emp.employmentType}
  </Typography>

  <Divider orientation="vertical" flexItem/>

   <Typography sx={{ fontSize: isSmallScreen ? '15px' : '16px', fontWeight: 400 }}>
  {getTotalDuration(
    emp.fromMonth,
    emp.fromYear,
    emp.toMonth,
    emp.toYear,
    emp.isCurrentEmployment
  )}
</Typography>

</Stack>

  <Typography sx={{ fontSize: isSmallScreen ? '15px' : '16px', fontWeight: 400, alignItems : 'center', mt: '6px'}}>

{emp.fromMonth} {emp.fromYear} -&nbsp;
    {emp.isCurrentEmployment
      ? 'present'
      : `${emp.toMonth} ${emp.toYear}`}
    &nbsp;
  </Typography>


  {/* <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1}}/> */}



</>
      ) : (
         <Stack direction="row" mt="4px" gap={1}>
      <Typography sx={{ fontSize: '16px', fontWeight: 400 }}>
    {emp.employmentType}
  </Typography>

  <Divider orientation="vertical" flexItem/>

  <Stack sx={{ display : 'flex', flexDirection : 'row'}}>

 <Typography sx={{ fontSize: '16px', fontWeight: 400 }}>
  {getTotalDuration(
    emp.fromMonth,
    emp.fromYear,
    emp.toMonth,
    emp.toYear,
    emp.isCurrentEmployment
  )}
</Typography>


  <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1}}/>

  <Typography sx={{ fontSize: '16px', fontWeight: 400, alignItems : 'center' }}>

{emp.fromMonth} {emp.fromYear} -&nbsp;
    {emp.isCurrentEmployment
      ? 'present'
      : `${emp.toMonth} ${emp.toYear}`}
    &nbsp;
  </Typography>
  </Stack>

</Stack>
      )}



{isSmallScreen ? (
  <>
  {(emp.employmentType !== 'Internship' && emp.isCurrentEmployment) && (
    <>

  <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>


   <Typography sx={{ fontSize: '15px', fontWeight: 400, mt: '6px' }}>
  <Box component="span" sx={{ color: 'grey'  }}>
    CTC :
  </Box>{" "}
  {formatCTC(emp.ctc, emp.currency)}
</Typography>


    <Typography sx={{ fontSize: '15px', fontWeight: 300, mt: '6px' }}>
      {emp.currency}
    </Typography>

  </Stack>


  {emp.isCurrentEmployment && (
    <>
    
     <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
    <Typography sx={{ fontSize: '15px', fontWeight: 400, mt: '6px' }}>
      <Box component="span" sx={{ color: 'grey'  }}>
    Notice Period :
  </Box>{" "}
  {emp.noticePeriod}
    </Typography>
  </Stack>
  </>

  )}

</>

)}
</>) : (
  <>
  {(emp.employmentType !== 'Internship' && emp.isCurrentEmployment) && (
  <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>

  <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>


   <Typography sx={{ fontSize: '16px', fontWeight: 400, mt: '4px' }}>
  <Box component="span" sx={{ color: 'grey'  }}>
    CTC :
  </Box>{" "}
  {formatCTC(emp.ctc, emp.currency)}
</Typography>


    <Typography sx={{ fontSize: '16px', fontWeight: 300, mt: '4px' }}>
      {emp.currency}
    </Typography>

  </Stack>


  {emp.isCurrentEmployment && (
    <>
  <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1}}/>
    
     <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
    <Typography sx={{ fontSize: '16px', fontWeight: 400, mt: '4px' }}>
      <Box component="span" sx={{ color: 'grey'  }}>
    Notice Period :
  </Box>{" "}
  {emp.noticePeriod}
    </Typography>
  </Stack>
  </>

  )}

  </Stack>

)}
</>
)}


    </Box>


))}


              </Stack>
              <AddOutlinedIcon onClick={handleDialogOpen} sx={{ cursor: "pointer", mt: 2, fontSize : '26px', color: '#735557', ":hover": { color: "#261FB3" } }}/>

           
            </Box>

      <SkillsComp />
      <ProjectsWorked />
      <Certifications />
      <JobPreferences />
      <UANDetails />


          </div>





        </Grid>
                )}

      
      </Grid>

      

<Dialog
  fullScreen
  open={isEditDialogOpen}
  onClose={handleEditDialogClose}
  TransitionComponent={Transition}
>
  <AppBar position="relative" sx={{ backgroundColor: "#fff", boxShadow: "none", borderBottom: "1px solid #e0e0e0" }}>
    <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
      <Stack sx={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
        <IconButton edge="start" color="inherit" onClick={handleEditDialogClose} aria-label="close">
          <CloseIcon sx={{ color: "#000" }} />
        </IconButton>
        <Typography sx={{ fontSize: '16px', fontWeight: 500, color: "#000" }}>
          Edit details
        </Typography>
      </Stack>

      <Button
        onClick={()=> handleUpdateEmpDetails()}
        color="success"
        sx={{
          borderRadius: "18px",
          backgroundColor: "#3A59D1",
          color: "#FFFFFF",
          px: 3,
          textTransform: "none",
          "&:hover": { backgroundColor: "#5b9f61" }
        }}
      >
        Update
      </Button>
    </Toolbar>
  </AppBar>

  <DialogContent dividers sx={{ px: isSmallScreen ? 4 : 9, pt: 0 }}>
    <Typography sx={{ mt: 2, fontSize: '16px', fontWeight: 500 }}>
      Employment
    </Typography>
    <Typography sx={{ fontSize: '14px', color: 'grey' }} mb={2}>
      Details like job title, company name, etc, help employers understand your work
    </Typography>

    <FormLabel sx={{ fontSize: '14px', fontWeight: 500, color: '#000', mt: 2 }}>
      Employment Type
    </FormLabel>
    <RadioGroup
      row
      name="employmentType"
      value={formData.employmentType}
      onChange={handleChange}
      sx={{ gap: isSmallScreen ? 1 : 5 }}
    >
      <FormControlLabel
        value="Full-time"
        control={<Radio sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />}
        label={<Typography sx={{ fontSize: '14px' }}>Full-time</Typography>}
      />
      <FormControlLabel
        value="Internship"
        control={<Radio sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />}
        label={<Typography sx={{ fontSize: '14px' }}>Internship</Typography>}
      />
    </RadioGroup>

    <Grid container spacing={2} mt={2}>
      <Grid item xs={12} md={6}>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
          Company Name
        </Typography>
        <TextField
          label={!formData.companyName ? 'Company Name' : ''}
          name="companyName"
          fullWidth
          value={formData.companyName}
          onChange={handleChange}
          required
          slotProps={{
            inputLabel: {
              sx: { fontSize: '14px', display: 'block', '&.Mui-focused': { display: 'none' } },
              shrink: false
            }
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
          Work Location
        </Typography>
        <TextField
          label={!selectedCity ? "Select City" : ""}
          value={cities.find((city) => city._id === selectedCity)?.city || ""}
          onClick={handleToggle}
          fullWidth
          InputProps={{ readOnly: true }}
          sx={{ cursor: "pointer" }}
          slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            style: { maxHeight: 200, width: 250, padding: "0.5rem" },
          }}
        >
          {cities.map((city) => (
            <MenuItem key={city._id} onClick={() => handleSelect(city._id)}>
              <FormControlLabel
                control={<Radio checked={selectedCity === city._id} />}
                label={city.city}
              />
            </MenuItem>
          ))}
        </Menu>
      </Grid>

      <Grid item xs={12} md={6}>
        <JobRoleSelector
          selectedRoleId={formData.jobRoleId}
          onRoleSelect={(roleId) => setFormData({ ...formData, jobRoleId: roleId })}
        />
      </Grid>

      {(formData.employmentType !== 'Internship' && formData.isCurrentEmployment) && (
        <Grid item xs={12} md={6}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
            Current CTC
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Select
              value={formData.currency || 'INR'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              displayEmpty
              variant="outlined"
              sx={{ minWidth: 80, fontSize: '14px' }}
            >
              {currencies.map((curr) => (
                <MenuItem key={curr.label} value={curr.label}>
                  {curr.label}
                </MenuItem>
              ))}
            </Select>

            <TextField
              name="ctc"
              type="number"
              fullWidth
              value={formData.ctc}
              onChange={handleChange}
              label={!formData.ctc ? "Current CTC" : ""}
              required
              slotProps={{
                inputLabel: {
                  sx: { fontSize: '14px', display: 'block', '&.Mui-focused': { display: 'none' } },
                  shrink: false
                }
              }}
            />
          </Box>
        </Grid>
      )}

      {/* Joining & Exit dates */}
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
          {currEmpTrue ? 'Joining Date' : 'Working From'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              name="fromYear"
              select
              fullWidth
              label={!formData.fromYear ? 'Select Year' : ''}
              value={formData.fromYear}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="fromMonth"
              select
              fullWidth
              label={!formData.fromMonth ? 'Select Month' : ''}
              value={formData.fromMonth}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>{month}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Grid>

      {!formData.isCurrentEmployment && (
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5, mt: 2 }}>
            Worked Till
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="toYear"
                select
                fullWidth
                label={!formData.toYear ? 'Select Year' : ''}
                value={formData.toYear}
                onChange={handleChange}
                slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="toMonth"
                select
                fullWidth
                label={!formData.toMonth ? 'Select Month' : ''}
                value={formData.toMonth}
                onChange={handleChange}
                slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>
      )}

      {formData.isCurrentEmployment && (
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
            Notice Period
          </Typography>
          <TextField
            name="noticePeriod"
            select
            fullWidth
            value={formData.noticePeriod}
            onChange={handleChange}
            label={!formData.noticePeriod ? "Select Notice Period" : ""}
            slotProps={{
              inputLabel: {
                sx: {
                  fontSize: "14px",
                  display: "block",
                  "&.Mui-focused": { display: "none" },
                },
                shrink: false,
              },
            }}
          >
            {[
              "15 Days or less",
              "1 Month",
              "2 Months",
              "3 Months",
              "Serving Notice Period"
            ].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}
    </Grid>
  </DialogContent>
</Dialog>

    

        <Dialog
  fullScreen
  open={isDialogOpen}
  onClose={handleDialogClose}
  TransitionComponent={Transition}
>
  <AppBar position="relative" sx={{ backgroundColor: "#fff", boxShadow: "none", borderBottom: "1px solid #e0e0e0" }}>
    <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>

      <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 2, alignItems : 'center'}}>

      <IconButton edge="start" color="inherit" onClick={handleDialogClose} aria-label="close">
        <CloseIcon sx={{ color: "#000" }} />
      </IconButton>
      <Typography sx={{fontSize : '16px', textAlign: "center", color: "#000", fontWeight: 500 }}>
        Employment Details
      </Typography>
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

  <DialogContent dividers sx={{ px: isSmallScreen ? 4 : 9, pt: 0 }}>
    {/* -- Your existing content here -- */}

    {/* Employment section */}
    <Typography sx={{ marginTop: '12px', fontSize: '16px', fontWeight: 500 }} gutterBottom>
      Employment
    </Typography>
    <Typography sx={{ marginTop: '12px', fontSize: '14px', color: 'grey' }} mb={2}>
      Details like job title, company name, etc, help employers understand your work
    </Typography>

    {/* Is current employment */}
    {hasEmployment && currEmpTrue ? ('') : (<>
      <FormLabel sx={{ fontSize: '14px', fontWeight: 500, color: '#000000' }}>
      Is this your current employment?
    </FormLabel>
    <RadioGroup
  row
  name="isCurrentEmployment"
  value={formData.isCurrentEmployment}
  onChange={handleChange}
  sx={{ gap: isSmallScreen ? 2 : 5, marginTop: '6px' }}
>


<Tooltip
    title={
      currEmpTrue
        ? 'Current employment details already added.'
        : ''
    }
    arrow
    placement="right-start"
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: '#BCCCDC',
          fontSize: '16px',
          padding: '10px',
          borderRadius: '4px',
          color: 'black',
        },
      },
    }}
  >
    <span>
      <FormControlLabel
        value="yes"
        disabled={currEmpTrue}
        control={
          <Radio
            sx={{
              color: 'black',
              '&.Mui-checked': {
                color: 'black',
              },
            }}
          />
        }
        label={<Typography sx={{ fontSize: '14px', color: 'black' }}>Yes</Typography>}
      />
    </span>
  </Tooltip>

  {/* NO option */}
  <Tooltip
    title={
      !currEmpTrue
        ? 'You need to add current employment details.'
        : ''
    }
    arrow
    placement="right-start"
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: '#BCCCDC',
          fontSize: '16px',
          padding: '10px',
          borderRadius: '4px',
          color: 'black',
        },
      },
    }}
  >
    <span>
      <FormControlLabel
        value="no"
        disabled={!currEmpTrue}
        control={
          <Radio
            sx={{
              color: 'black',
              '&.Mui-checked': {
                color: 'black',
              },
            }}
          />
        }
        label={<Typography sx={{ fontSize: '14px', color: 'black' }}>No</Typography>}
      />
    </span>
  </Tooltip>




</RadioGroup>
    </>)}
  


    {/* Employment type */}
    <FormLabel sx={{ fontSize: '14px', fontWeight: 500, color: '#000000', marginTop: '22px' }}>
      Employment Type
    </FormLabel>
    <RadioGroup
      row
      name="employmentType"
      value={formData.employmentType}
      onChange={handleChange}
      sx={{ gap: isSmallScreen ? 1 : 5 }}
    >
      <FormControlLabel
        value="Full-time"
        control={<Radio sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />}
        label={<Typography sx={{ fontSize: '14px', color: 'black' }}>Full-time</Typography>}
      />
      <FormControlLabel
        value="Internship"
        control={<Radio sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />}
        label={<Typography sx={{ fontSize: '14px', color: 'black' }}>Internship</Typography>}
      />
    </RadioGroup>




    {/* Grid section */}
    <Grid container spacing={2} mt={1} mb={4}>


 <Grid container spacing={2} sx={{ pl: isSmallScreen ? 2 : 2, mt: 0.5}}>

     <Grid item xs={12} md={6}>
      <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5,
            }}
          >

            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
              {currEmpTrue ? 'Company Name' : 'Current Company'}
            </Typography>

   
          </Box>

          <TextField
            label={currEmpTrue?  !formData.companyName ? 'Company Name' : '' : !formData.companyName ? 'Current Company Name' : ''}
            name="companyName"
            fullWidth
            value={formData.companyName}
            onChange={handleChange}
            required
            slotProps={{
              inputLabel: {
                sx: {
                  fontSize: '14px',
                  '&.Mui-focused': { display: 'none' },
                  display: 'block',
                },
                shrink: false,
              },
            }}
          />

  
      </Box>

      </Grid>

      

<Grid item xs={12} md={6}>
  <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
    Work Location
  </Typography>

  <Box>
    <TextField
      label={!selectedCity ? "Select City" : ""}
      value={
        cities.find((city) => city._id === selectedCity)?.city || ""
      }
      onClick={handleToggle}
      fullWidth
      InputProps={{ readOnly: true }}
      sx={{ cursor: "pointer" }}
       slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
    />

    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{
        style: { maxHeight: 200, width: 250, padding: "0.5rem" },
      }}
    >
      {cities.map((city) => (
        <MenuItem
          key={city._id}
          onClick={() => handleSelect(city._id)}
        >
          <FormControlLabel
            control={
              <Radio checked={selectedCity === city._id} />
            }
            label={city.city}
          />
        </MenuItem>
      ))}
    </Menu>
  </Box>
</Grid>




      

 </Grid>

   

      {/* Designation */}

      <Grid container spacing={2} sx={{ pl: isSmallScreen ? 2 : 2, mt: 0.5}}>

          <Grid item xs={12} md={6}>


        <JobRoleSelector
  selectedRoleId={formData.jobRoleId}
  onRoleSelect={(roleId) => setFormData({ ...formData, jobRoleId: roleId })}
/>

      </Grid>

        {/* CTC */}
      {( formData.employmentType !== 'Internship' && !currEmpTrue )&& (
      <Grid item xs={12} md={6}>
  <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
  {currEmpTrue?  'CTC' : 'Current CTC'}
  </Typography>
  <Box sx={{ display: 'flex', gap: 1, alignItems : 'center'}}>
   
    <Select
      value={formData.currency || 'INR'}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          currency: e.target.value,
        }))
      }
      displayEmpty
      variant="outlined"
      sx={{ minWidth: 80, height: '100%', fontSize: '14px' }}
    >
      {currencies.map((curr) => (
        <MenuItem key={curr.label} value={curr.label}>
          {curr.label}
        </MenuItem>
      ))}
    </Select>

    <TextField
      name="ctc"
      type="number"
      value={formData.ctc}
      onChange={handleChange}
      required
      fullWidth
      sx={{ flex: 1}}
      slotProps={{
        inputLabel: {
          sx: {
            fontSize: '14px',
            '&.Mui-focused': { display: 'none' },
            display: 'block',
          },
          shrink: false,
        },
      }}
    
    />
  </Box>
</Grid>
      )}

    
      </Grid>


      <Grid item xs={12}>

            { !currEmpTrue ? (
  <>

  <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5}}>
          Working From
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <TextField
              label={!formData.fromYear ? 'Year of Joining' : ''}
              name="fromYear"
              select
              fullWidth
              value={formData.fromYear}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label={!formData.fromMonth ? 'Month of Joining' : ''}
              name="fromMonth"
              select
              fullWidth
              value={formData.fromMonth}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={month}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
        </>
        
      ) : (
        
        <>
            <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5}}>
          Joining date
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <TextField
              label={!formData.fromYear ? 'Select Year' : ''}
              name="fromYear"
              select
              fullWidth
              value={formData.fromYear}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label={!formData.fromMonth ? 'Select Month' : ''}
              name="fromMonth"
              select
              fullWidth
              value={formData.fromMonth}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={month}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5, mt : 3}}>
          Worked till
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <TextField
              label={!formData.toYear ? 'Select Year' : ''}
              name="toYear"
              select
              fullWidth
              value={formData.toYear || ''}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label={!formData.toMonth ? 'Select Month' : ''}
              name="toMonth"
              select
              fullWidth
              value={formData.toMonth}
              onChange={handleChange}
              slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={month}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
          </>

        ) }
      </Grid>
    
    

    


{currEmpTrue ? ('') : (<>
  <Grid item xs={12} >
  <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
    Notice Period
  </Typography>
  <TextField
    name="noticePeriod"
    select
    fullWidth
    value={formData.noticePeriod}
    onChange={handleChange}
    label={!formData.noticePeriod ? "Select Notice Period" : ""}
    slotProps={{
      inputLabel: {
        sx: {
          fontSize: "14px",
          "&.Mui-focused": {
            display: "none",
          },
          display: "block",
        },
        shrink: false,
      },
    }}
  >
    {[
      "15 Days or less",
      "1 Month",
      "2 Months",
      "3 Months",
      "Serving Notice Period",
    ].map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
  </TextField>
</Grid>
</>)}



    </Grid>





  </DialogContent>

</Dialog>




      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
  <DialogTitle>Delete Employment</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete this employment entry? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog} color="primary" sx={{ textTransform : 'none'}}>
      Cancel
    </Button>
    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ textTransform : 'none'}}>
      Delete
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={isNameEditDialogOpen} onClose={handleCloseNameEditDialog}>
  <DialogTitle sx={{ fontSize : isSmallScreen ? '16px' : '18px'}}>Edit Applicant Name</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Applicant Name"
      fullWidth
      value={editApName}
      onChange={(e) => setEditApName(e.target.value)}
    />
   
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseNameEditDialog}>Cancel</Button>
    <Button onClick={handleSaveNameEdit} variant="contained">Save</Button>
  </DialogActions>
</Dialog>


    

    </>
  );
}

export default CareerDetails;
