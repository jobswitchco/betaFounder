import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Slide,
  Chip,
  IconButton,
  DialogTitle,
  Autocomplete,
  Stack,
  CircularProgress
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useDebounce from './useDebounce'
import BatchPredictionOutlinedIcon from '@mui/icons-material/BatchPredictionOutlined';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SkillsComp() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  const [input, setInput] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
    const [ userDetails, setUserDetails ] = useState({});
    const [skillToDelete, setSkillToDelete] = useState(null);
      const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));


  const baseUrl = "http://localhost:8001/usersOn";

  const debouncedInput = useDebounce(input, 400);
  

  useEffect(() => {
    if (!debouncedInput) {
      setSuggestedSkills([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`${baseUrl}/search-skills`, {
          params: { query: debouncedInput }
        });

        if (response.data.success) {
          setSuggestedSkills(response.data.skills || []);
        }
      } catch (error) {
        console.error("Error fetching skill suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [debouncedInput]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(baseUrl + "/get-user-details", {}, { withCredentials: true });
  
        if (response.data.success) {
          setUserDetails(response.data.data); 
        } else {
          toast.error("Session expired. Please log in again.");
          setTimeout(() => navigate('/professional/login'), 2000);
        }
      } catch (error) {
        toast.error("Network error. Please log in again.");
        setTimeout(() => navigate('/professional/login'), 2000);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []); 
  

  const handleDialogClose = () => setIsDialogOpen(false);
  const handleDeleteDialogClose = () => setIsDeleteDialogOpen(false);
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDeleteDialogOpen = (skillId) => {
    setSkillToDelete(skillId);
    setIsDeleteDialogOpen(true);
  };


  const handleAddSkill = (skillObj) => {
    if (!skillObj || skills.find((s) => s._id === skillObj._id)) return;
  
    setSkills([...skills, { _id: skillObj._id, name: skillObj.name}]);
    setInput(""); // clear input after adding
    setSuggestedSkills([]); // reset suggestions
  };

  const handleDeleteSkill = (skillId) => {
    setSkills(skills.filter((s) => s._id !== skillId));
  };
  

  const deleteSkillFromAcc = async () => {
    try {
      const response = await axios.post(
        baseUrl + '/remove_user_skill',
        { skillId: skillToDelete },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSkills(skills.filter(skill => skill._id !== skillToDelete));
        const updatedUserResponse = await axios.post(baseUrl + '/get-user-details', {}, { withCredentials: true });
        
        if (updatedUserResponse.data.success) {
        
        toast.success("Skill deleted successfully.");
          setUserDetails(updatedUserResponse.data.data);
          handleDeleteDialogClose();
        }
      }
    } catch (error) {
      toast.error("Error deleting skill.");
    } finally {
      setIsDialogOpen(false);
      setSkillToDelete(null);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        baseUrl + '/save_user_skills',
        { skills },
        { withCredentials: true }
      );
  
      if (response.data.success) {
       
        toast.success('Skills Saved');
        const updatedUserResponse = await axios.post(baseUrl + '/get-user-details', {}, { withCredentials: true });
        
        if (updatedUserResponse.data.success) {
          setUserDetails(updatedUserResponse.data.data);
          handleDialogClose();
        }
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  


  return (
    <>

      <Box
        sx={{
          display: "flex",
          flexDirection : 'column',
          border: "1px solid grey",
          px: 2,
          py: 2,
          mt: 2,
          borderRadius: "8px",
        }}
      >
        <Stack sx={{ display : 'flex', flexDirection : 'row', justifyContent : 'space-between', mb: 1}}>

   <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 1, alignItems : 'center'}}>
                  <BatchPredictionOutlinedIcon sx={{ fontSize : '22px'}}/>
        <Typography sx={{ fontSize: "16px", fontWeight: 500, color : '#BF2EF0' }}>Key skills</Typography>


                </Stack>
        <IconButton onClick={handleDialogOpen} size="small">
          <AddOutlinedIcon
            sx={{ cursor: "pointer", fontSize: "26px", color: "#735557", ":hover": { color: "#261FB3" } }}
          />
        </IconButton>
        </Stack>

        <div>
        { loading ? ( <Box
                        sx={{
                         display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%', 
                          width: '100%',
                        }}
                      >
                        <CircularProgress size="small" sx={{ color : '#71C0BB'}}/>
                      </Box>) : userDetails?.skills?.length > 0 ? (
        userDetails.skills.map((skill) => (
          <Box key={skill._id} sx={{ display: "inline-block", mr: 1, mt: 0.5 }}>
            <Chip
              label={skill.name}
              onDelete={() => handleDeleteDialogOpen(skill._id)}
              sx={{ backgroundColor : skill.color, mb: isSmallScreen ? '6px' : ''}}
            />
          </Box>
        ))
      ) : (
      ''
      )}

        </div>
      </Box>

    



      <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth>
        {/* <DialogTitle>Key Skills</DialogTitle> */}
        <DialogContent>
  <Typography gutterBottom sx={{ fontSize : '16px', mb : 0.5, fontWeight : 500}} >
    Key Skills
  </Typography>
  <Typography gutterBottom sx={{ fontSize : '14px', color : 'grey', mb : 3}} >
    Add skills that best define your expertise, for e.g, Direct Marketing, Oracle, etc.
  </Typography>

  <Box display="flex" gap={1} flexWrap="wrap" mb={4}>
  {skills.map((skill) => (
    <Chip
      key={skill._id || skill.name}
      label={skill.name}
      onDelete={() => handleDeleteSkill(skill._id)}
      sx={{ backgroundColor: '#16C47F', color: '#000000' }}
    />
  ))}
</Box>


  <Autocomplete
  freeSolo
  options={suggestedSkills.filter(
    (s) => !skills.find((skill) => skill._id === s._id)
  )}
  getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
  inputValue={input}
  onInputChange={(event, newInputValue) => {
    setInput(newInputValue);
  }}
  onChange={(event, newValue) => {
    if (typeof newValue === "string" && newValue.trim() !== "") {
      // user typed a new skill
      handleAddSkill({ _id: null, name: newValue.trim() });
    } else if (newValue && typeof newValue === "object") {
      // user selected a suggestion
      handleAddSkill(newValue);
    }
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Add skills"
      variant="outlined"
      fullWidth
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAddSkill({ _id: null, name: input.trim() });
        }
      }}
    />
  )}
/>


</DialogContent>


        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        TransitionComponent={Transition}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this skill?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="secondary">Cancel</Button>
          <Button onClick={deleteSkillFromAcc} color="primary">Proceed</Button>
        </DialogActions>
      </Dialog>


      </>
  );
}

export default SkillsComp;
