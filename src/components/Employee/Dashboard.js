// Dashboard.jsx
import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Divider,
  Chip,
  useMediaQuery
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import FeaturedVideoOutlinedIcon from '@mui/icons-material/FeaturedVideoOutlined';
import BatchPredictionOutlinedIcon from '@mui/icons-material/BatchPredictionOutlined';
// Icons
import RedditIcon from "../../images/redditIcon.png";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";

// ---------- Styled components ----------
const Greeting = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(2)
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(1)
}));

const ActionCardRoot = styled(Card)(({ theme }) => ({
  borderRadius: 14,
  boxShadow:
    "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  transition: "transform 120ms ease, box-shadow 120ms ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      "0 4px 8px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.10)"
  }
}));

function ActionCard({ icon, title, subtitle, onClick, color = "default" }) {
  return (
    <ActionCardRoot>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            {/* Left column: Icon */}
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                color:
                  color === "reddit"
                    ? "error.dark"
                    : color === "ok"
                    ? "success.dark"
                    : color === "li"
                    ? "primary.dark"
                    : color === "browse"
                    ? "info.dark"
                    : "text.secondary",
              }}
            >
              {icon}
            </Box>

              <Typography sx={{ fontFamily : 'Inter', fontSize : '16px', fontWeight : 500}}>
                {title}
              </Typography>

          </Stack>


            {/* Right column: Title + Subtitle */}
            <Box>
            
              <Typography
              sx={{ fontFamily : 'Inter', fontSize : '13px', fontWeight : 400, color: 'grey'}}
              >
                {subtitle}
              </Typography>
            </Box>
        </CardContent>
      </CardActionArea>
    </ActionCardRoot>
  );
}


// ---------- Main component ----------
export default function Dashboard({
  userName = "Bhaskar",
  // Wire these up to your routing/navigation:
  onCreateRedditPost = () => console.log("Create Reddit Post"),
  onValidateIdea = () => console.log("Validate Idea"),
  onCreateLinkedInPost = () => console.log("Write LinkedIn Post"),
  onDailyBrowse = () => console.log("Daily Browse"),
  onOpenDrafts = () => console.log("Open Drafts"),
  onOpenScheduled = () => console.log("Open Scheduled"),
  onOpenValidations = () => console.log("Open Validations")
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = React.useState(0);

  return (
    <Box sx={{ minHeight: "100vh"}}>

      {/* Page Content */}
      <Container maxWidth="lg">
        <Greeting>
          <Typography
            sx={{fontFamily : 'Inter', fontSize : isMobile ? '18px' : '26px', fontWeight : 600, ineHeight: 1.25 }}
          >
            Ready to write, validate, or browse?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Your founder workspace for content & insights.
          </Typography>
        </Greeting>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            aria-label="Dashboard tabs"
          >
            <Tab label="Reddit" sx={{ textTransform : 'none'}} />
            <Tab label="LinkedIn" sx={{ textTransform : 'none'}} />
            <Tab label="Daily Browse" sx={{ textTransform : 'none'}} />
          </Tabs>
        </Box>

        {/* Overview content (like in the image: all sections visible) */}
        <Box role="tabpanel" hidden={tab !== 0} sx={{ pt: 2, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={4}>
              <ActionCard
                icon={
    <img
      src={RedditIcon}
      alt="Reddit"
      style={{
        width: 30,
        height: 30,
        objectFit: "contain"
      }}
    />
  }
                title="Create a Reddit Post"
                subtitle="Turn your draft/ideas into powerful Reddit posts by following subreddit rules and get more visibility. Write in your own voice guided by viral formats."
                onClick={onCreateRedditPost}
                color="reddit"
              />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <ActionCard
                icon={<BatchPredictionOutlinedIcon sx={{ width : '30px', height : '30px'}}/>}
                title="Validate an Idea"
                subtitle="Test your startup idea with real users from Reddit via comments and replies. Test your startup idea with real users from Reddit via comments and replies."
                onClick={onValidateIdea}
                color="ok"
              />
            </Grid>

            <Grid item xs={12} md={4} lg={4}>
              <ActionCard
               icon={ <FeaturedVideoOutlinedIcon sx={{ width : '28px', height : '28px', color : '#AE75DA'}}/>}
                title="Feature Request"
                subtitle="Turn your draft/ideas into powerful Reddit posts by following subreddit rules and get more visibility. Write in your own voice guided by viral formats."
                onClick={onCreateRedditPost}
                color="reddit"
              />
            </Grid>
         

          </Grid>
        </Box>

        <Box role="tabpanel" hidden={tab !== 1} sx={{ pt: 2, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ActionCard
                icon={<LinkedInIcon />}
                title="Write LinkedIn Post"
                subtitle="Draft LinkedIn post in your founder voice"
                onClick={onCreateLinkedInPost}
                color="li"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ActionCard
                icon={<InsightsRoundedIcon />}
                title="Daily Browse"
                subtitle="See what founders are reading today"
                onClick={onDailyBrowse}
                color="browse"
              />
            </Grid>
          </Grid>
        </Box>

        <Box role="tabpanel" hidden={tab !== 2} sx={{ pt: 2, mt: 2 }}>
        
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <ActionCard
                icon={<ArticleRoundedIcon />}
                title="Top 3 founder stories"
                subtitle="Handpicked reads to sharpen your edge"
                onClick={onDailyBrowse}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ActionCard
                icon={<LinkedInIcon />}
                title="Must-see LinkedIn posts"
                subtitle="What operators are talking about"
                onClick={onDailyBrowse}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ActionCard
                icon={<InsightsRoundedIcon />}
                title="Trends & signals"
                subtitle="Market movements worth your time"
                onClick={onDailyBrowse}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Sticky utilities (drafts/scheduled/validations) */}
        <Box sx={{ mt: 4, mb: 8 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="flex-start"
          >
            <Chip
              icon={<ArticleRoundedIcon />}
              label="Drafts"
              onClick={onOpenDrafts}
              variant="outlined"
            />
            <Chip
              icon={<EventAvailableRoundedIcon />}
              label="Scheduled"
              onClick={onOpenScheduled}
              variant="outlined"
            />
            <Chip
              icon={<AssignmentTurnedInRoundedIcon />}
              label="Validations"
              onClick={onOpenValidations}
              variant="outlined"
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
