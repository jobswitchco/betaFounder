import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  CircularProgress,
  Grid
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { toast } from "react-toastify";

function ProjectsWorked() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
const [editingProjectId, setEditingProjectId] = useState(null);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [selectedProjectId, setSelectedProjectId] = useState(null);


  const baseUrl = "http://localhost:8001/usersOn";


  const [newProject, setNewProject] = useState({
    projectName: "",
    roleInProject: "",
    projectSummary: "",
    responsibilities: "",
    projectImpact: "",
    projectLinks: [""]
  });

 

 const fetchProjects = async () => {
  try {
    setLoading(true);
    const res = await axios.post(
      baseUrl + '/get-projects-worked',
      {},
      { withCredentials: true }
    );

    if (res.data.success) {
      setProjects(res.data.data || []);
    } else {
      toast.error("Session expired. Please login.");
    }
  } catch (err) {
    console.error("Error fetching projects:", err);
    toast.error("Failed to fetch project data.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDialogOpen = () => setIsDialogOpen(true);
 const handleDialogClose = () => {
  setIsDialogOpen(false);
  setOpen(false);
  setIsEditMode(false);
  setEditingProjectId(null);
  setNewProject({
    projectName: "",
    roleInProject: "",
    projectSummary: "",
    responsibilities: "",
    projectImpact: "",
    projectLinks: [""]
  });
};

const handleDeleteProject = async (projectId) => {
  try {
    const res = await axios.post(
      baseUrl + `/delete-project/${projectId}`,
      {},
      { withCredentials: true }
    );

    if (res.data.success) {
      toast.success("Project deleted");
      fetchProjects(); // Refresh list
    } else {
      toast.error(res.data.message || "Failed to delete");
    }
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Server error while deleting");
  } finally {
    setDeleteDialogOpen(false);
    setSelectedProjectId(null);
  }
};




     const handleProjectChange = (e) => {
      const { name, value } = e.target;
      setNewProject(prev => ({ ...prev, [name]: value }));
    };

    const handleProjectLinkChange = (e, idx) => {
      const updatedLinks = [...newProject.projectLinks];
      updatedLinks[idx] = e.target.value;
      setNewProject({ ...newProject, projectLinks: updatedLinks });
    };
    
    const handleAddProjectLink = () => {
      setNewProject({ ...newProject, projectLinks: [...newProject.projectLinks, ""] });
    };
    
    const handleRemoveProjectLink = (idx) => {
      const updatedLinks = newProject.projectLinks.filter((_, i) => i !== idx);
      setNewProject({ ...newProject, projectLinks: updatedLinks });
    };

const handleAddOrUpdateProject = async () => {
  const { projectName, roleInProject, projectSummary, responsibilities } = newProject;

  if (
    !projectName.trim() ||
    !roleInProject.trim() ||
    !projectSummary.trim() ||
    !responsibilities.trim()
  ) {
    toast.warning("All fields are mandatory");
    return;
  }

  try {
    const url = isEditMode
      ? `${baseUrl}/update-project/${editingProjectId}`
      : `${baseUrl}/add-project`;

    const res = await axios.post(url, newProject, { withCredentials: true });

    if (res.data.success) {
      toast.success(isEditMode ? "Project updated." : "Project added.");
      fetchProjects();
      setNewProject({
        projectName: "",
        roleInProject: "",
        projectSummary: "",
        responsibilities: "",
        projectImpact: "",
        projectLinks: [""]
      });
      setIsEditMode(false);
      setEditingProjectId(null);
      handleDialogClose();
    }
  } catch (err) {
    toast.error(isEditMode ? "Failed to update project." : "Failed to save project.");
  }
};



  return (
    <Box
      sx={{
        border: "1px solid grey",
        px: 2,
        py: 2,
        mt: 2,
        borderRadius: "8px"
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <AccountTreeOutlinedIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: "#00809D" }}>Projects</Typography>
        </Stack>
        <IconButton onClick={()=> setOpen(true)}>
          <AddOutlinedIcon
            sx={{ fontSize: 24, color: "#735557", ":hover": { color: "#261FB3" } }}
          />
        </IconButton>
      </Stack>

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        projects.map((proj, index) => (
          <Accordion
            key={proj._id || index}
            sx={{
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              backgroundColor: '#FAFAFA',
              mt: 2,
              '&:before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
  {proj.projectName?.length > 80
    ? proj.projectName.slice(0, 80) + "..."
    : proj.projectName}
</Typography>


            </AccordionSummary>
            <AccordionDetails>
           
              <Grid container spacing={1}>
           
                 {proj?.roleInProject && 
                 (
                 <>
                    <Grid item xs={12} sm={2}>
                   <Typography sx={{ fontWeight: 500, fontSize: '15px' }}>Role</Typography>
                 </Grid>
                 <Grid item xs={12} sm={10}>
                   <Typography sx={{ fontSize: '15px' }}>{proj.roleInProject || 'N/A'}</Typography>
                 </Grid>
                 </>
           
                 )}
                
            {proj?.projectSummary && 
                 (
                 <>
                 <Grid item xs={12} sm={2}>
                   <Typography sx={{ fontWeight: 500, fontSize: '15px' }}>Summary</Typography>
                 </Grid>
                 <Grid item xs={12} sm={10}>
                   <Typography sx={{ fontSize: '15px' }}>{proj.projectSummary || 'N/A'}</Typography>
                 </Grid>
                 </>
                 )}
           
                  {proj?.responsibilities && 
                 (
                 <>
               
                 <Grid item xs={12} sm={2}>
                   <Typography sx={{ fontWeight: 500, fontSize: '15px' }}>Responsibilities</Typography>
                 </Grid>
                 <Grid item xs={12} sm={10}>
                   <Typography sx={{ fontSize: '15px' }}>{proj.responsibilities || 'N/A'}</Typography>
                 </Grid>
                 </>
                 )}
           
                   {proj?.projectImpact && 
                 (
                 <>
               
                  <Grid item xs={12} sm={2}>
                   <Typography sx={{ fontWeight: 500, fontSize: '15px' }}>Impact</Typography>
                 </Grid>
                 <Grid item xs={12} sm={10}>
                   <Typography sx={{ fontSize: '15px' }}>{proj.projectImpact || 'N/A'}</Typography>
                 </Grid>
                 </>
                 )}
           {Array.isArray(proj?.projectLinks) && proj.projectLinks.some(link => link.trim()) && (
  <>
    <Grid item xs={12} sm={2}>
      <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5 }}>Links</Typography>
    </Grid>
    <Grid item xs={12} sm={10}>
      {proj.projectLinks
        .filter(link => link.trim())
        .map((link, idx) => (
          <Typography
            key={idx}
            component="a"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#3A59D1',
              textDecoration: 'underline',
              fontSize: '14px',
              display: 'block',
              mb: 0.5,
            }}
          >
            {link}
          </Typography>
        ))}
    </Grid>
  </>
)}


               <Grid item mt={2}>
          <Button
  onClick={() => {
    setSelectedProjectId(proj._id);
    setDeleteDialogOpen(true);
  }}
  sx={{
    borderRadius: "18px",
    border: '1px solid #B0B0B0',
    color: "#000000",
    px: 2,
    mr: 2,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#DC2525",
      color: '#FFFFFF',
      borderColor: '#DC2525',
    },
  }}
>
  Delete
</Button>


             <Button
  onClick={() => {
    setIsEditMode(true);
    setEditingProjectId(proj._id);
    setNewProject({
      projectName: proj.projectName || "",
      roleInProject: proj.roleInProject || "",
      projectSummary: proj.projectSummary || "",
      responsibilities: proj.responsibilities || "",
      projectImpact: proj.projectImpact || "",
      projectLinks: proj.projectLinks?.length ? proj.projectLinks : [""],
    });
    setOpen(true);
  }}
  color="success"
  sx={{
    borderRadius: "18px",
    backgroundColor: "#3A59D1",
    color: "#FFFFFF",
    px: 4,
    mr: 2,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#5b9f61",
    },
  }}
>
  Edit
</Button>


               </Grid>


           
           
               
               </Grid>

             
            </AccordionDetails>
          </Accordion>
        ))
      )}

     <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
             <DialogTitle sx={{ fontSize : '18px', fontWeight : 500}}>Add Project Details</DialogTitle>
             <DialogContent dividers >
               <Stack mt={1}>
               <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                 Project Name
               </Typography>
                 <TextField
                   name="projectName"
                  label={!newProject.projectName ? "e.g., Invoice Automation System, Sales Dashboard" : "" }
                   fullWidth
                   value={newProject.projectName}
                   onChange={handleProjectChange}
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
                 />
     
     <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5, mt : 2 }}>
                 Role
               </Typography>
                 <TextField
                   name="roleInProject"
                   label={!newProject.roleInProject ? "eg., UI/UX Designer, Lead Developer" : "" }
                   fullWidth
                   value={newProject.roleInProject}
                   onChange={handleProjectChange}
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
                 />
     
     <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5, mt : 2 }}>
                 Project Summary
               </Typography>
                 <TextField
                   name="projectSummary"
                   label={!newProject.projectSummary ? "e.g., Developed a scalable API system to handle 1M+ users" : ""}
                   fullWidth
                   multiline
                   value={newProject.projectSummary}
                   onChange={handleProjectChange}
                   sx={{
                     '& .MuiInputBase-root': {
                       minHeight: '120px', // Fixed overall field height
                       alignItems: 'flex-start', // Align text to top
                     },
                     '& .MuiInputBase-inputMultiline': {
                       height: '100%', // Ensure textarea fills the container
                       overflow: 'auto', // Scroll if content overflows
                     },
                   }}
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
                 />
     
                 <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5, mt : 2 }}>
                 Responsibilities
               </Typography>
                 <TextField
                   name="responsibilities"
                   label={!newProject.responsibilities ? "e.g., Handled all backend API calls" : ""}
                   fullWidth
                   multiline
                   value={newProject.responsibilities}
                   onChange={handleProjectChange}
                   sx={{
                     '& .MuiInputBase-root': {
                       minHeight: '120px',
                       alignItems: 'flex-start',
                     },
                     '& .MuiInputBase-inputMultiline': {
                       height: '100%',
                       overflow: 'auto',
                     },
                   }}
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
                 />
     
     <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 0.5}}>
     <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5, mt : 2 }}>
                 Project Impact
               </Typography>
     
               <Typography sx={{ fontSize: "14px", fontWeight: 400, mb: 0.5, mt : 2, color : 'grey' }}>
               (optional)
               </Typography>
               </Stack>
     
     
                 <TextField
                   name="projectImpact"
                   label={!newProject.projectImpact ? "e.g., Boosted conversion rate by 25% through UX improvements" : "" }
                   fullWidth
                   multiline
                   value={newProject.projectImpact}
         onChange={handleProjectChange}
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
                 />
     
     
     <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, mt: 2, alignItems : 'center' }}>
       <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
         Project Links
       </Typography>
       <Typography sx={{ fontSize: "14px", fontWeight: 400, color: 'grey' }}>
         (optional)
       </Typography>
     </Stack>
     
     {(newProject.projectLinks || []).map((link, idx) => (
       <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
         <TextField
         name="projectLinks"
           fullWidth
           placeholder="e.g., https://github.com/project, https://projectdemo.com"
           value={link}
           onChange={(e) => handleProjectLinkChange(e, idx)}
           sx={{
             flexGrow: 1,
             '& input::placeholder': {
               fontSize: '14px',
             },
           }}
         />
         <Button
           onClick={() => handleRemoveProjectLink(idx)}
           sx={{ minWidth: 0, ml: 1 }}
         >
           ❌
         </Button>
       </Box>
     ))}
     
     <Button
       onClick={handleAddProjectLink}
       variant="outlined"
       sx={{ mt: 1, width: 'fit-content', textTransform: 'none', color : '#7F55B1' }}
     >
       ➕ Add link
     </Button>
     
     
     
               </Stack>
             </DialogContent>
             <DialogActions>
               <Button onClick={() => setOpen(false)} sx={{ color : 'grey'}}>
                 Cancel
               </Button>
               <Button
  onClick={handleAddOrUpdateProject}
  color="success"
  sx={{
    borderRadius: "18px",
    backgroundColor: "#3A59D1",
    color: "#FFFFFF",
    px: 3,
    mr: 2,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#5b9f61",
    },
  }}
>
  {isEditMode ? "Update" : "Save"}
</Button>

             </DialogActions>
           </Dialog>

           <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
  <DialogTitle sx={{ fontSize: '16px', fontWeight: 500 }}>
    Are you sure you want to delete this project?
  </DialogTitle>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
      Cancel
    </Button>
    <Button
      onClick={() => handleDeleteProject(selectedProjectId)}
      color="error"
      sx={{ textTransform: 'none' }}
    >
      Proceed
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}

export default ProjectsWorked;
