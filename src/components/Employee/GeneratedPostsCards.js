import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function DashboardCards() {
  const location = useLocation();
  const campaign_id = "5lMMjsXcQN2xgIC";
  const baseUrl = "http://localhost:8001/usersOn";
  const [applyingFix, setApplyingFix] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  // Failure dialog state
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [violations, setViolations] = useState([]);
  const [suggestedFix, setSuggestedFix] = useState("");

  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    if (!campaign_id) return;

    const fetchPosts = async () => {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const day = new Date().toLocaleDateString("en-US", { weekday: "long" });

        const res = await axios.post(
          `${baseUrl}/generated-posts`,
          { campaign_id, timeZone, day },
          { withCredentials: true }
        );

        if (res.data.success) {
          setPosts(res.data.posts);
        }
      } catch (err) {
        console.error("❌ Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [campaign_id]);

  const truncateText = (text, maxLength = 250) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // const handleOpen = (post) => {
  //   setSelectedPost(post);
  //   setEditTitle(post.post_title);
  //   setEditContent(post.post_content);
  //   setIsEdited(false);

  //   // ✅ Preselect first available slot if exists
  //   if (post.slots && post.slots.length > 0) {
  //     setSelectedSlot(`${post.slotType} ${post.slots[0]}`);
  //   } else {
  //     setSelectedSlot("");
  //   }

  //   setOpen(true);
  // };


  const handleOpen = (post) => {
  setSelectedPost(post);
  setEditTitle(post.post_title);
  setEditContent(post.post_content);
  setIsEdited(false);

  if (post.slots && post.slots.length > 0) {
    setSelectedSlot(`${post.slotType} ${post.slots[0]}`);
  } else {
    // ✅ Default to hardcoded slot
    setSelectedSlot("Today 10:04 - 10: 19");
  }

  setOpen(true);
};

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedPost) return;
    setSaving(true);

    try {
      const res = await axios.post(
        `${baseUrl}/update-post`,
        {
          post_id: selectedPost._id,
          post_title: editTitle,
          post_content: editContent,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedPost = res.data.updated_post;
        setPosts((prev) =>
          prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
        );
        setIsEdited(false);
        handleClose();
      } else {
        setErrorMessage(res.data.message || "Update failed due to rules");
        setViolations(res.data.violations || []);
        setSuggestedFix(res.data.suggested_fix || "");
        setErrorDialogOpen(true);
      }
    } catch (err) {
      console.error("❌ Error saving changes:", err);
      setErrorMessage("Unexpected error updating post");
      setViolations([]);
      setSuggestedFix("");
      setErrorDialogOpen(true);
    } finally {
      setSaving(false);
    }
  };

  // ✅ New: Schedule Post
  const handleSchedulePost = async () => {
    if (!selectedPost || !selectedSlot) {
      alert("Please select a time slot first!");
      return;
    }

    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await axios.post(
        `${baseUrl}/schedule-reddit-post`,
        {
          post_id: selectedPost._id,
          timeslot: selectedSlot,
          campaign_id,
          timeZone,
        },
        { withCredentials: true }
      );

      if (res.data.scheduled) {
        alert(`✅ Scheduled "${selectedPost.post_title}" at ${selectedSlot}`);
        handleClose();
      } else {
        alert("❌ Failed to schedule post.");
      }
    } catch (err) {
      console.error("❌ Error scheduling post:", err);
      alert("❌ Error scheduling post.");
    }
  };

  if (loading) return <Typography>Loading posts...</Typography>;

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        {posts.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              onClick={() => handleOpen(item)}
              sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: 3,
                transition: "0.3s",
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Typography
                  gutterBottom
                  sx={{ fontFamily: "Inter", fontSize: "15px", fontWeight: 500 }}
                >
                  {item.post_title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {truncateText(item.post_content, 250)}
                </Typography>
                <Typography
                  variant="caption"
                  color="primary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  {item.sub_reddit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for edit & schedule */}
      <Dialog open={open} onClose={() => {}} disableEscapeKeyDown fullWidth maxWidth="sm">
        {selectedPost && (
          <>
            <DialogTitle
              sx={{
                fontFamily: "Inter",
                fontSize: "15px",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ flex: 1, pr: 1 }}>
                <TextField
                  variant="standard"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setIsEdited(true);
                  }}
                  fullWidth
                  multiline
                  maxRows={4}
                  InputProps={{
                    disableUnderline: true,
                    style: { fontFamily: "Inter", fontSize: "15px", fontWeight: 600 },
                  }}
                />
              </Box>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <TextField
                multiline
                fullWidth
                variant="standard"
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  setIsEdited(true);
                }}
                InputProps={{
                  disableUnderline: true,
                  style: { fontFamily: "Inter", fontSize: "15px", fontWeight: 400 },
                }}
              />
            </DialogContent>

            <DialogActions sx={{ display: "flex", justifyContent: "space-between", px: 3, py: 2 }}>
              {/* Best Time Slots dropdown */}
              {/* <TextField
                select
                label="Best Time to Post"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                size="small"
                sx={{ minWidth: 220 }}
                SelectProps={{ native: true }}
              >
                <option value="" disabled>
                  -- Select Slot --
                </option>
                {selectedPost.slots?.map((slot, idx) => (
                  <option key={idx} value={`${selectedPost.slotType} ${slot}`}>
                    {selectedPost.slotType} {slot}
                  </option>
                ))}
              </TextField> */}

              <TextField
  select
  label="Best Time to Post"
  value={selectedSlot}
  onChange={(e) => setSelectedSlot(e.target.value)}
  size="small"
  sx={{ minWidth: 220 }}
  SelectProps={{ native: true }}
>
  <option value="" disabled>
    -- Select Slot --
  </option>

  {/* ✅ Hardcoded slot */}
  <option value="Today 10:04 - 10:19">Today 10:04 - 10:19</option>

  {/* ✅ Dynamic slots from backend */}
  {selectedPost.slots?.map((slot, idx) => (
    <option key={idx} value={`${selectedPost.slotType} ${slot}`}>
      {selectedPost.slotType} {slot}
    </option>
  ))}
</TextField>


              <Stack direction="row" spacing={2}>
                {isEdited && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleSaveChanges}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} /> : null}
                    sx={{ textTransform: "none" }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSchedulePost}
                  sx={{ textTransform: "none" }}
                >
                  Schedule
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Failure Dialog */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Update Failed</DialogTitle>
        <DialogContent>
          <Typography color="error" gutterBottom>
            {errorMessage}
          </Typography>

          {violations.length > 0 && (
            <>
              <Typography variant="subtitle2">Violations:</Typography>
              <ul>
                {violations.map((v, i) => (
                  <li key={i}>
                    <Typography variant="body2">{v}</Typography>
                  </li>
                ))}
              </ul>
            </>
          )}

          {suggestedFix && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Suggested Fix:
              </Typography>
              <Typography variant="body2">{suggestedFix}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {suggestedFix && (
            <Button
              variant="contained"
              color="primary"
              disabled={applyingFix}
              onClick={async () => {
                try {
                  setApplyingFix(true);
                  const res = await axios.post(
                    `${baseUrl}/update-post`,
                    {
                      post_id: selectedPost._id,
                      post_title: editTitle,
                      post_content: editContent,
                      apply_fix: true,
                      suggested_fix: suggestedFix,
                    },
                    { withCredentials: true }
                  );

                  if (res.data.success) {
                    const updatedPost = res.data.updated_post;
                    setPosts((prev) =>
                      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
                    );
                    setEditTitle(updatedPost.post_title);
                    setEditContent(updatedPost.post_content);
                    setIsEdited(false);
                    setErrorDialogOpen(false);
                    setOpen(true);
                  }
                } catch (err) {
                  console.error("❌ Error applying fix:", err);
                } finally {
                  setApplyingFix(false);
                }
              }}
              startIcon={applyingFix ? <CircularProgress size={16} /> : null}
              sx={{ textTransform: "none" }}
            >
              {applyingFix ? "Applying Fix..." : "Apply Fix"}
            </Button>
          )}
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
