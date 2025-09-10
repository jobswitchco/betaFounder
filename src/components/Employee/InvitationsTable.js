import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  IconButton,
  Pagination,
  Paper,
  Stack
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import ConversationDialog from "./ConversationDialog";
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import noInvitationsImg from '../../images/no_invitations_img.svg'




const InvitationsTable = () => {
  const [invitations, setInvitations] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const baseUrl = "http://localhost:8001/usersOn";
    const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));



 const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchInvitations = async (pg = page) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${baseUrl}/get-invitations-for-professional`,
        { page: pg, limit },
        { withCredentials: true }
      );

      setInvitations(res.data.invitations || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || pg);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
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
                     await  fetchInvitations(1);  // fetch page 1 initially
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

  const handlePageChange = (event, value) => {
  fetchInvitations(value);
};


  const handleOpenConversation = (conversationId, employerInfo) => {
    setSelectedConv({ conversationId, employer: employerInfo });
    setDialogOpen(true);
  };

  return (
    <>
     

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
      ) : invitations.length === 0 ? (

      <Stack
    sx={{
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    <img
      className="img-fluid rounded no-data-img-props"
      src={noInvitationsImg}
      alt="youtube-icon"
      style={{ marginBottom: isMobile ? '4px' : '16px' }}
    />
    <Typography>No interview invitations yet — hang tight! Companies are actively reviewing your profile.</Typography>
  </Stack>
      ) : (

        <Box>
              <Toolbar
                        disableGutters
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          pl: 0.5,
                        }}
                      >
                        <Typography sx={{ fontSize: "18px", fontWeight: 500 }}>
                          Invitations
                        </Typography>
            
                     
                      </Toolbar>

{isMobile ? (
  <>
   <Box>
          {invitations.map((inv, idx) => (
           <Paper
  key={idx}
  elevation={2}
  sx={{
    mb: 2,
    p: 2,
    borderLeft: "4px solid #FF5722",
    backgroundColor: !inv.isRead ? '#EAEFEF' : 'white'
  }}
>

              <Typography sx={{ color: "text.secondary", fontSize : '14px', mb: '2px' }}>
                #{idx + 1} • {dayjs(inv.sentAt).format("MMM D, YYYY h:mm A")}
              </Typography>
              <Typography sx={{ fontSize : '15px', fontWeight: 500, mt: 1 }}>
                {inv.employer?.company_name || "N/A"}
              </Typography>

              <Stack sx={{ display : 'flex', flexDirection: 'row', justifyContent : 'space-between', alignItems : 'center'}}>

                       <Typography variant="body2" sx={{ mt: 1, color: "text.primary" }}>
  {(inv.lastMessage?.length > 25
    ? inv.lastMessage.slice(0, 25) + "..."
    : inv.lastMessage) || "No message"}
</Typography>


              <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                <IconButton
                  onClick={() =>
                    handleOpenConversation(inv.conversationId, inv.employer)
                  }
                  size="small"
                  color="primary"
                >
                  <SendOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>

              </Stack>
             
      


            </Paper>
          ))}
        </Box>
  </>
) : (

  <>
    <TableContainer >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Last Message</TableCell>
                <TableCell>Received At</TableCell>
                <TableCell>Conversation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.map((inv, idx) => (
              <TableRow
  key={idx}
  sx={{
    backgroundColor: !inv.isRead ? '#EAEFEF' : 'inherit'
  }}
>

                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{inv.employer?.company_name || "N/A"}</TableCell>
                  <TableCell>{inv.lastMessage}</TableCell>
                  <TableCell>
                    {inv.sentAt
                      ? dayjs(inv.sentAt).format("MMM D, YYYY h:mm A")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                 

                     <IconButton
                                                size="small"
                                                 onClick={() =>
                        handleOpenConversation(inv.conversationId, inv.employer)
                      }
                                            >
                                                <SendOutlinedIcon fontSize="small" color="secondary" />
                                               
                                            </IconButton>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

         <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                  count={totalPages}
                                  page={page}
                                  onChange={handlePageChange}
                                  color="secondary"
                                />
                              </Box>
  </>

  

)}

                      



       

          


        </Box>
      
      )}

      {/* Conversation dialog */}
    {selectedConv && (
  <ConversationDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    conversationId={selectedConv.conversationId}
    employer={selectedConv.employer}
    onMessageRead={() => {
      setInvitations(prev =>
        prev.map(conv =>
          conv.conversationId === selectedConv.conversationId
            ? { ...conv, isRead: true }
            : conv
        )
      );
    }}
  />
)}

    </>
  );
};

export default InvitationsTable;
