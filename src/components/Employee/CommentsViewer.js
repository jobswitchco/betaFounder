import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  Collapse,
  Avatar,
  Divider,
  Badge
} from "@mui/material";
import { motion } from "framer-motion";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import he from "he";

const categories = [
  "all",
  "feedback",
  "suggestion",
  "question",
  "resource",
  "humor",
  "spam",
  "uncategorized",
];

export default function CommentsViewer() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [commentsByCategory, setCommentsByCategory] = useState({});
  const baseUrl = "http://localhost:8001/usersOn";
  const postId='t3_1n2fcl2';
  const commentsContainerRef = useRef(null);
  const commentRefs = useRef({});



  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
  if (commentsContainerRef.current) {
    commentsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [selectedCategory]);

useEffect(() => {
  let firstComment;
  if (selectedCategory === "all") {
    const cats = Object.keys(commentsByCategory);
    if (cats.length > 0) {
      firstComment = commentsByCategory[cats[0]]?.[0];
    }
  } else {
    firstComment = commentsByCategory[selectedCategory]?.[0];
  }

  if (firstComment && commentRefs.current[firstComment.comment_id]) {
    commentRefs.current[firstComment.comment_id].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [selectedCategory, commentsByCategory]);



  // total count for each category
const getCategoryCount = (cat) => {
  if (cat === "all") {
    return Object.values(commentsByCategory).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  }
  return commentsByCategory[cat]?.length || 0;
};

function formatRelativeDate(timestamp) {
  const createdDate = new Date(timestamp); // ✅ works with ISO string or Date object
  const now = new Date();

  const diffMs = now - createdDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const timeStr = createdDate.toLocaleTimeString([], { hour12: false }); // HH:mm:ss

  if (diffDay === 0) {
    return `Today ${timeStr}`;
  } else if (diffDay === 1) {
    return `Yesterday ${timeStr}`;
  } else if (diffDay < 7) {
    return `${diffDay} days ago ${timeStr}`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago ${timeStr}`;
  } else if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months} month${months > 1 ? "s" : ""} ago ${timeStr}`;
  } else {
    const years = Math.floor(diffDay / 365);
    return `${years} year${years > 1 ? "s" : ""} ago ${timeStr}`;
  }
}




  const fetchComments = async () => {
    try {
      const res = await axios.get(`${baseUrl}/fetch/comments/${postId}`);
      setCommentsByCategory(res.data.data || {});
    } catch (err) {
      console.error("❌ Error fetching comments:", err);
    }
  };

const CommentCard = React.forwardRef(({ comment, depth = 0 }, ref) => {
  const [open, setOpen] = useState(false);

  const getBgColor = () => {
    if (comment.sentiment === "positive") return "#81E7AF";
    if (comment.sentiment === "negative") return "#FF8282";
    return "#f5f5f5";
  };

  return (
    <motion.div
      ref={ref}  // 🔥 attach ref here
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mt: 2,
          ml: depth * 4,
          p: 2,
          borderRadius: "16px",
          boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
          backgroundColor: getBgColor(),
        }}
      >
    

        {/* Author + Timestamp */}
        <Stack direction="row" spacing={2} alignItems="center">
         <Avatar
    sx={{
      width: 28,   // smaller width
      height: 28,  // smaller height
      fontSize: 14, // smaller text inside avatar
    }}
  >{comment.author?.charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography sx={{ fontFamily : 'Inter', fontSize : '14px', fontWeight : 600}}>
              {comment.author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
             {formatRelativeDate(comment.created_utc)}
            </Typography>
          </Box>
        </Stack>

        {/* Body */}
        <Typography
       sx={{ fontFamily : 'Inter', fontSize : '15px', fontWeight : 400}}
          mt={1}
          component="div"
          dangerouslySetInnerHTML={{ __html: he.decode(comment.body_html) }}
        />

        {/* Meta Info */}
        <Stack direction="row" spacing={2} mt={1} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ThumbUpAltOutlinedIcon fontSize="small" />
            <Typography variant="caption">{comment.ups}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ChatBubbleOutlineIcon fontSize="small" />
            <Typography variant="caption">Replies</Typography>
          </Stack>

          {/* Sentiment Tag */}
          {comment.sentiment && (
            <Typography
              variant="caption"
              sx={{
                ml: 1,
                px: 1,
                borderRadius: "8px",
                backgroundColor:
                  comment.sentiment === "positive"
                    ? "#c8e6c9" // darker green for tag
                    : comment.sentiment === "negative"
                    ? "#ffcdd2" // darker red for tag
                    : "#e0e0e0", // grey for neutral
                color:
                  comment.sentiment === "positive"
                    ? "#2e7d32"
                    : comment.sentiment === "negative"
                    ? "#c62828"
                    : "#616161",
              }}
            >
              {comment.sentiment}
            </Typography>
          )}
        </Stack>

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <Box mt={1}>
           <Button
  size="small"
  onClick={() => setOpen(!open)}
  sx={{
    textTransform: "none",
    color: "#3338A0", // 🔥 blue
    fontWeight: 500,
    "&:hover": {
      color: "#1565c0", // darker blue on hover
    },
  }}
>
  {open ? "Hide replies" : `View replies (${comment.replies.length})`}
</Button>

            <Collapse in={open}>
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.comment_id}
                  comment={reply}
                  depth={depth + 1}
                />
              ))}
            </Collapse>
          </Box>
        )}
      </Card>
    </motion.div>
  );
});

  return (
  <Box p={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    {/* Sticky Category Filter Buttons */}
    <Stack
      direction="row"
      spacing={1}
      mb={2}
      flexWrap="wrap"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#f5f7f8", // ensures buttons don’t overlap with comments
        py: 1,
      }}
    >
      {categories.map((cat) => {
        const count = getCategoryCount(cat);
        return (
          <motion.div key={cat} whileTap={{ scale: 0.9 }}>
            <Badge
              badgeContent={count}
              overlap="circular"
              sx={{
                "& .MuiBadge-badge": {
                  borderRadius: "50%",
                  minWidth: 22,
                  height: 22,
                  fontSize: "0.75rem",
                  backgroundColor: "#86A788",
                  color: "#fff",
                },
              }}
            >
              <Button
                variant={selectedCategory === cat ? "contained" : "outlined"}
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor:
                    selectedCategory === cat ? "transparent" : "#CDC1FF",
                  px: 2,
                  py: 0.5,
                  textTransform: "capitalize",
                  backgroundColor:
                    selectedCategory === cat ? "#A294F9" : "#f5f5f5",
                  color: selectedCategory === cat ? "#fff" : "#000",
                  "&:hover": {
                    backgroundColor:
                      selectedCategory === cat ? "#1565c0" : "#e0e0e0",
                    borderColor:
                      selectedCategory === cat ? "transparent" : "grey",
                  },
                  "&.Mui-focusVisible": {
                    borderColor:
                      selectedCategory === cat ? "transparent" : "grey",
                  },
                }}
              >
                {cat}
              </Button>
            </Badge>
          </motion.div>
        );
      })}
    </Stack>

    {/* Scrollable Comments */}
<Box ref={commentsContainerRef} sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
  {selectedCategory === "all"
    ? Object.keys(commentsByCategory).map((cat) => (
        <Box key={cat} mb={4}>
          {commentsByCategory[cat].map((c) => (
          <CommentCard
  key={c.comment_id}
  comment={c}
  ref={(el) => (commentRefs.current[c.comment_id] = el)}
/>

          ))}
          <Divider sx={{ my: 2 }} />
        </Box>
      ))
    : (commentsByCategory[selectedCategory] || []).map((c) => (
      <CommentCard
  key={c.comment_id}
  comment={c}
  ref={(el) => (commentRefs.current[c.comment_id] = el)}
/>

      ))}
</Box>

  </Box>
);

}
