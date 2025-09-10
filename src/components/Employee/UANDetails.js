import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Stack,
  Dialog,
  DialogContent
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { RecentActors } from '@mui/icons-material';
import { IconButton } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const baseUrl = "http://localhost:8001/usersOn";

const UANDetails = () => {
  const [editing, setEditing] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${baseUrl}/get-user-additional-details`, {}, { withCredentials: true });
        if (res.data.success) {
          setLinkedinUrl(res.data.data.linkedinUrl || "");
        } else {
          toast.error("Failed to fetch user details");
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.post(
        `${baseUrl}/update-user-additional-details`,
        { linkedinUrl },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("LinkedIn URL updated");
        setEditing(false);
      } else {
        toast.error("Failed to update");
      }
    } catch (err) {
      toast.error("Error while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress sx={{ color: "#71C0BB" }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ border: "1px solid grey", p: 3, borderRadius: "8px", mt: 2, mb: 12 }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', mb: 0.5 }}>
          <RecentActors sx={{ fontSize: '22px' }} />
          <Typography sx={{ fontSize: "16px", fontWeight: 500, color: '#FF4F0F' }}>
            Additional Details
          </Typography>
        </Stack>

        <Typography sx={{ mb: 3, fontSize: '14px', color: '#093FB4' }}>
          Profiles with a valid LinkedIn URL attracts 10x more recruiters.
        </Typography>

        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              fullWidth
              label="LinkedIn URL"
              value={linkedinUrl}
              onClick={() => setEditing(true)}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              InputProps={{
                readOnly: !editing,
              }}
            />
            {editing && (
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} mt={0.5} ml={0.5}>
            <Typography variant="caption" sx={{ color: "gray", fontSize: "12px" }}>
              Why it is important
            </Typography>
            <IconButton
              size="small"
              sx={{ p: 0, color: "gray" }}
              onClick={() => setHelpDialogOpen(true)}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)}>
        <DialogContent>
          <Typography sx={{ fontSize: '14px' }}>
            Adding your LinkedIn URL helps recruiters better understand your professional background and skills.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UANDetails;
