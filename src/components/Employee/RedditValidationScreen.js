import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  useMediaQuery,
  Grid,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import ArrowRightAltOutlinedIcon from "@mui/icons-material/ArrowRightAltOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [option, setOption] = useState("validateIdea");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const baseUrl = "http://localhost:8001/usersOn";
  const navigate = useNavigate();

  const steps = [
    "Finding best subreddits to post...",
    "Checking the subreddits rules...",
    "Generating best title and content for the subreddits...",
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setOpenDialog(true);
    setCurrentStep(0);

    const payload = { type: option, formData };

    // Step 1 simulation
    setTimeout(() => {
      setCurrentStep(1);
    }, 9000);

    // Step 2 simulation
    setTimeout(() => {
      setCurrentStep(2);
    }, 21000);

    // Step 3 → wait for backend
    try {
      const res = await axios.post(baseUrl + "/data-from-dashboard", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      // Once backend responds → mark step 3 as ✅
      setCurrentStep(3);

      setTimeout(() => {
        if (res.data.success) {
          navigate("/professional/generated/posts", {
            state: { campaign_id: res.data.campaign_id },
          });
        } else {
          alert("Post generation failed!");
          setOpenDialog(false);
        }
      }, 1000);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Something went wrong, try again.");
      setOpenDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const optionConfigs = {
    validateIdea: {
      title: "Idea Validation Lab",
      fields: [
        { label: "What is your startup idea?", placeholder: "e.g., A LinkedIn AI tool that writes in my voice..." },
        { label: "What problem does it solve?", placeholder: "e.g., It saves time, maintains authenticity..." },
        { label: "If website or app is live? Share URL", placeholder: "e.g., www.postLn.com" },
      ],
      actionText: "Proceed",
    },
    askFeedback: {
      title: "Ask for Feedback",
      fields: [
        { label: "What do you want feedback on?", placeholder: "e.g., Landing page copy, product demo..." },
        { label: "Who should give the feedback?", placeholder: "e.g., Designers, Founders, Developers..." },
        { label: "What is your goal with this feedback?", placeholder: "e.g., Improve clarity, validate design..." },
      ],
      actionText: "Ask Community",
    },
    featureValidation: {
      title: "Feature Validation Lab",
      fields: [
        { label: "What feature do you want to test?", placeholder: "e.g., Dark mode toggle..." },
        { label: "Who will benefit from this feature?", placeholder: "e.g., Night-time readers, devs..." },
        { label: "What outcome do you expect?", placeholder: "e.g., More engagement, lower churn..." },
      ],
      actionText: "Validate Feature",
    },
    getVisitors: {
      title: "Get Visitors",
      fields: [
        { label: "What do you want to promote?", placeholder: "e.g., Landing page, blog, tool..." },
        { label: "Who is your audience?", placeholder: "e.g., Startup founders, marketers..." },
        { label: "Where do you want to attract them from?", placeholder: "e.g., Reddit, Twitter, LinkedIn..." },
      ],
      actionText: "Start Getting Visitors",
    },
  };

  const currentConfig = optionConfigs[option];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        p: isMobile ? 0 : 2,
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
        {/* Options */}
        <Grid container spacing={2} justifyContent="center">
          {[
            { value: "validateIdea", label: "Validate Idea" },
            { value: "askFeedback", label: "Ask for Feedback" },
            { value: "featureValidation", label: "Feature Validation" },
            { value: "getVisitors", label: "Get Visitors" },
          ].map((btn) => (
            <Grid item xs={isMobile ? 6 : "auto"} key={btn.value}>
              <Button
                onClick={() => setOption(btn.value)}
                variant={option === btn.value ? "contained" : "outlined"}
                fullWidth={isMobile}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  px: isMobile ? 1 : 2.5,
                  py: 1,
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: option === btn.value ? "White" : "Black",
                  border:
                    option === btn.value ? "transparent" : "1px solid #D3DAD9",
                  background:
                    option === btn.value
                      ? "linear-gradient(90deg, #ff4de1, #6a00ff, #00e1ff)"
                      : "transparent",
                  boxShadow:
                    option === btn.value
                      ? "0 0 12px rgba(255, 77, 225, 0.6)"
                      : "none",
                }}
              >
                {btn.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Card */}
        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            p: 4,
            maxWidth: isMobile ? "100%" : 800,
            width: "100%",
            textAlign: "center",
            background: "linear-gradient(145deg, #000000, #320A6B)",
            color: "white",
          }}
        >
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
            Tell us about your idea in 3 quick steps ✨
          </Typography>

          {/* Fields */}
          <Stack spacing={5}>
            {currentConfig.fields.map((field, index) => (
              <TextField
                key={index}
                fullWidth
                variant="outlined"
                label={field.label}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field.label, e.target.value)}
                InputLabelProps={{ shrink: true, style: { color: "#ccc" } }}
                InputProps={{ style: { color: "white", borderRadius: 12, fontSize: "14px" } }}
                multiline
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#555" },
                    "&:hover fieldset": { borderColor: "#aaa" },
                    "&.Mui-focused fieldset": { borderColor: "#bb86fc" },
                  },
                }}
              />
            ))}
          </Stack>

          {/* Action */}
          <Button
            endIcon={<ArrowRightAltOutlinedIcon />}
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              mt: 4,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              background: "linear-gradient(90deg, #ff4de1, #6a00ff, #00e1ff)",
              fontWeight: 500,
              fontFamily: "Inter",
              textTransform: "none",
              boxShadow: "0 0 20px rgba(255, 77, 225, 0.5)",
            }}
          >
            {loading ? "Submitting..." : currentConfig.actionText}
          </Button>
        </Paper>
      </Stack>

      {/* Dialog */}
     <Dialog open={openDialog} fullWidth maxWidth="sm">
  <DialogTitle
    sx={{
      fontFamily: "Inter",
      fontSize: "15px",
      px: 3,
      pt: 4,
      pb: 2,
    }}
  >
    Processing your request...
  </DialogTitle>

  <DialogContent
    sx={{
      px: 3, // horizontal padding
      py: 6, // vertical padding
    }}
  >
    <Stack spacing={2}>
      {steps.map((step, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          {index < currentStep ? (
            <CheckCircleIcon sx={{ color: "green" }} />
          ) : index === currentStep ? (
            <CircularProgress size={20} />
          ) : (
            <span style={{ width: 20 }} />
          )}
          <Typography
            variant="body1"
            sx={{ color: index < currentStep ? "green" : "text.primary" }}
          >
            {step}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </DialogContent>
</Dialog>

    </Box>
  );
}
