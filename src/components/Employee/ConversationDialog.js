import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Button,
  Slide,
  Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useState, forwardRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";




// Slide transition for full-screen dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConversationDialog = ({ open, onClose, conversationId, onMessageRead}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const baseUrl = "http://localhost:8001/usersOn";
    const bottomRef = useRef(null);
        const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  


 const fetchMessages = async () => {
  setLoading(true);
  try {
    const res = await axios.post(
      `${baseUrl}/get-conversation-by-id`,
      { conversationId },
      { withCredentials: true }
    );
    setMessages(res.data.messages || []);

    if (res.data.messages?.length > 0) {
      await axios.post(
        `${baseUrl}/mark-messages-read`,
        { conversationId },
        { withCredentials: true }
      );

       onMessageRead?.(); 
    }
  } catch (err) {
    console.error("Failed to fetch messages:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (open && conversationId) {
      fetchMessages();
    }
  }, [open, conversationId]);

    useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



  const handleSend = async () => {
    if (!messageInput.trim()) return;
    try {
      await axios.post(
        `${baseUrl}/send-message-by-professional`,
        { conversationId, content: messageInput },
        { withCredentials: true }
      );
      setMessageInput("");
      await fetchMessages(); // refresh chat
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
   
        <AppBar
           elevation={0}
        sx={{
          position: "relative",
          bgcolor: "#FFFDF6",
           boxShadow: "none"
        }}
      >

         <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: isMobile ? "14px" : "16px", color: 'grey' }}>
            Conversation Window
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Refresh" placement="left" arrow>
              <span>
                <IconButton
                  onClick={fetchMessages}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>

      </AppBar>



      <Box sx={{ p: 2, flex: 1, overflowY: "auto", height: "calc(100vh - 130px)" }}>
        {loading ? (
            <Box
                                       sx={{
                                         position: 'fixed',
                                         top: '50%',
                                         left: '50%',
                                         transform: 'translate(-50%, -50%)',
                                         zIndex: 9999
                                       }}
                                     >
                                       <CircularProgress />
                                     </Box>
        ) : messages.length === 0 ? (
          <Typography>No messages found.</Typography>
        ) : (
          <Stack spacing={2}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  maxWidth: "80%",
                  borderRadius: 2,
                  backgroundColor:
                    msg.senderType === "employer" ? "#E0F7FA" : "#F1F8E9",
                  alignSelf:
                    msg.senderType === "employer" ? "flex-start" : "flex-end",
                }}
              >
                <Typography sx={{ fontSize : isMobile ? '15px' : '16px'}}>{msg.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(msg.sentAt).format("MMM D, YYYY h:mm A")}
                </Typography>
               

              </Box>
            ))}

               <div ref={bottomRef} />


          </Stack>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          p: 2,
          borderTop: "1px solid #eee",
          backgroundColor: "#fafafa",
        }}
      >
       <TextField
  value={messageInput}
  onChange={(e) => setMessageInput(e.target.value)}
  placeholder="Type your message..."
  multiline
  minRows={isMobile ? 3: 10}
  maxRows={6}
  fullWidth
  autoFocus
  sx={{
    '& .MuiInputBase-root': {
      overflow: 'hidden',
    },
    textarea: {
      resize: 'none',
    },
  }}
/>

        <Button
          onClick={handleSend}
          variant="contained"
          sx={{ ml: 1 }}
          disabled={!messageInput.trim()}
        >
          <SendIcon />
        </Button>
      </Box>
    </Dialog>
  );
};

export default ConversationDialog;
