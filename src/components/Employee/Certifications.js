import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogContent,
  Stack,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";


const baseUrl = "http://localhost:8001/usersOn";

const Certifications = () => {
     const theme = useTheme();
      const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
  open: false,
  certId: null,
});
const [formErrors, setFormErrors] = useState({
  certificationName: false,
  issuedBy: false,
  issuedOn: false,
});




  const [formData, setFormData] = useState({
    certificationName: "",
    issuedBy: "",
    issuedOn: "",
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${baseUrl}/get-user-certifications`, {}, {
        withCredentials: true,
      });
      if (res.data.success) {
        setCertifications(res.data.data || []);
      } else {
        toast.error("Failed to load certifications");
      }
    } catch {
      toast.error("Error fetching certifications");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (cert = null) => {
    if (cert) {
      setEditMode(true);
      setSelectedCertId(cert._id);
      setFormData(cert);
    } else {
      setEditMode(false);
      setSelectedCertId(null);
      setFormData({ certificationName: "", issuedBy: "", issuedOn: "" });
    }
    setCertDialogOpen(true);
  };

const handleSave = async () => {
  const errors = {
    certificationName: !formData.certificationName,
    issuedBy: !formData.issuedBy,
    issuedOn: !formData.issuedOn,
  };

  setFormErrors(errors);

  if (Object.values(errors).some((val) => val)) {
    toast.warn("All fields are mandatory");
    return;
  }

  try {
    if (editMode) {
      const res = await axios.put(
        `${baseUrl}/update-user-certification`,
        { certId: selectedCertId, ...formData },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Certification updated");
        fetchCertifications();
      } else {
        toast.error("Update failed");
      }
    } else {
      const res = await axios.post(
        `${baseUrl}/add-user-certification`,
        formData,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Certification added");
        fetchCertifications();
      } else {
        toast.error("Add failed");
      }
    }
    setCertDialogOpen(false);
  } catch {
    toast.error("Error saving certification");
  }
};


  const handleDelete = async (certId) => {
    try {
      const res = await axios.delete(`${baseUrl}/delete-user-certification`, {
        data: { certId },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Certification deleted");
        setCertifications((prev) => prev.filter((c) => c._id !== certId));
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Error deleting certification");
    }
  };

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 3, mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
       
         <Stack sx={{ display : 'flex', flexDirection : 'row', gap: 1, alignItems : 'center', mb: 0.5}}>
                               <WorkspacePremiumOutlinedIcon sx={{ fontSize : '22px'}}/>
                     <Typography sx={{ fontSize: "16px", fontWeight: 500, color : '#FF4F0F' }}>Certifications</Typography>
             
             
                             </Stack>
       
        <IconButton onClick={() => openDialog()} size="small">
          <Add />
        </IconButton>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : certifications.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No certifications added yet.
        </Typography>
      ) : (
        certifications.map((cert) => (
          <Box key={cert._id} sx={{ mb: 2, p: 1, borderBottom: "1px solid #eee" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography sx={{fontSize: '16px', fontWeight: 500 }}>{cert.certificationName}</Typography>
                <Typography sx={{ fontSize : '15px', color: '#000000'}}>{cert.issuedBy}</Typography>
                <Typography sx={{ fontSize : '15px', color: 'grey'}}>
  Issued on: {new Date(cert.issuedOn).toLocaleDateString("en-GB")}
</Typography>

              </Box>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={() => openDialog(cert)}>
                  <Edit fontSize="small" />
                </IconButton>
               <IconButton
  size="small"
  onClick={() =>
    setConfirmDeleteDialog({ open: true, certId: cert._id })
  }
>
  <Delete fontSize="small" />
</IconButton>

              </Stack>
            </Stack>
          </Box>
        ))
      )}

      <Dialog fullWidth open={certDialogOpen} onClose={() => setCertDialogOpen(false)}>
        <DialogContent>
          <Stack spacing={2} >
            <TextField
  label="Certification Name"
  value={formData.certificationName}
  onChange={(e) =>
    setFormData({ ...formData, certificationName: e.target.value })
  }
  error={formErrors.certificationName}
  helperText={formErrors.certificationName && "Required"}
  fullWidth
/>

<TextField
  label="Issued By"
  value={formData.issuedBy}
  onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
  error={formErrors.issuedBy}
  helperText={formErrors.issuedBy && "Required"}
  fullWidth
/>

<TextField
  label="Issued On"
  type="date"
  value={formData.issuedOn}
  onChange={(e) => setFormData({ ...formData, issuedOn: e.target.value })}
  InputLabelProps={{ shrink: true }}
  error={formErrors.issuedOn}
  helperText={formErrors.issuedOn && "Required"}
  fullWidth
/>

            <Button variant="contained" onClick={handleSave}>
              {editMode ? "Update" : "Add"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
  open={confirmDeleteDialog.open}
  onClose={() => setConfirmDeleteDialog({ open: false, certId: null })}
>
  <DialogContent>
    <Typography sx={{ fontSize: "16px", mb: 2 }}>
      Are you sure you want to delete this certification?
    </Typography>
    <Stack direction="row" spacing={2} justifyContent="flex-end">
      <Button
        variant="outlined"
        onClick={() => setConfirmDeleteDialog({ open: false, certId: null })}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => {
          handleDelete(confirmDeleteDialog.certId);
          setConfirmDeleteDialog({ open: false, certId: null });
        }}
      >
        Confirm
      </Button>
    </Stack>
  </DialogContent>
</Dialog>

    </Box>
  );
};

export default Certifications;
