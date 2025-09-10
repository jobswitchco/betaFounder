import express from "express";
import axios from "axios";
import cookieParser from "cookie-parser";
const router = express.Router();
import USER from "../models/RedditUser.js";
import WAITLISTUSER from "../models/WaitListUsers.js";
import ASKEDPRICE from "../models/AskedPricing.js";
router.use(cookieParser());
import authenticateToken from "../middleware/authenticateTokenProfessional.js";
import generateJWTtoken  from "../middleware/generateJWTtoken.js";
import path from "path";
import agenda from "./agenda.js";
import { definePublishJob } from "./publishPostJob.js";
definePublishJob(agenda);

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDIRECT_URI = "http://betafounder.co/auth/reddit/callback";


router.post("/logout", authenticateToken, (req, res) => {
  res.clearCookie("token_professional", {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});


router.post("/send_reddit_code", async (req, res) => {
  const code = req.body.code;

  if (!code) return res.status(400).send("Missing code from Reddit");

  try {
    // STEP 1: Exchange code for access token
    const tokenRes = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const access_token = tokenRes.data.access_token;
    const refresh_token = tokenRes.data.refresh_token;
    const accessToken_expires_in = tokenRes.data.expires_in;

    // STEP 2: Fetch user's Reddit profile
    const profileRes = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: { Authorization: `bearer ${access_token}` },
    });

    const redditProfile = profileRes.data;
    const redditId = redditProfile.id;
    const name = redditProfile.name;
    const picture = redditProfile.icon_img || null;

    let user = await USER.findOne({ redditId });

    const now = new Date();
    let wasNew = false;

    if (!user) {
      user = await USER.create({
        redditId,
        name,
        picture,
        access_token,
        refresh_token,
        accessToken_expires_in,
        last_login: now,
        loginHistory: [now],
      });
      wasNew = true;
    } else {
      await USER.updateOne(
        { _id: user._id },
        {
          $set: {
            last_login: now,
            updated_at: now,
            access_token,
            refresh_token,
            accessToken_expires_in,
          },
          $push: { loginHistory: now },
        }
      );
    }

    const token = await generateJWTtoken(user._id, user.redditId);

    res.cookie("token_professional", token, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: wasNew
        ? "User registered successfully"
        : "User logged in successfully",
      user: {
        user_id: user._id,
        user_name: user.name,
        user_email: user.redditId,
      },
      token,
    });
  } catch (err) {
    console.error("Reddit Login error:", err.response?.data || err);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred",
    });
  }
});




router.get("/verify-login-token", authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ valid: false });
  }
  return res.status(200).json({ valid: true, user: req.user });
  
});



  router.get('/get-user-details', authenticateToken, async function (req, res){

    const userId = req.user?.user_id;

        if (!userId) {
          return res.status(400).json({ message: "Username is invalid." });
        }
  
    USER.findById(userId).then((result)=>{
  
      if(result){
  
      res.status(200).send({ success: true, data: { name: result.name, lastLogin: result.last_login, linkedInUrl : result.linkedinUrl}});
      res.end();

  
      }
  
      else{
      res.status(200).send({ success: false, data: null });
      res.end();
  
      }
  
    }).catch(e2=>{
  
      console.error("❌ Error fetching campaign details:", e2);
      return res.status(500).json({ error: "Internal Server Error" });
  
    })
  });


  // routes/waitlist.js (or wherever your router is)
router.post("/waitlist-join-gmail", async (req, res) => {
  try {
    const { email, firstName, lastName, picture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Normalize email (simple)
    const normalizedEmail = String(email).trim().toLowerCase();

    let user = await WAITLISTUSER.findOne({ email: normalizedEmail });

    let wasNew = false;

    if (!user) {
      // Create new user if they don't exist
      user = await WAITLISTUSER.create({
        email: normalizedEmail,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        picture,
        is_google_user: true,
      });
      wasNew = true;

      return res.status(200).json({
        success: true,
        wasNew: true,
        message: "User registered successfully",
        userId: user._id, // optional
      });
    }

    // If user already exists
    return res.status(200).json({
      success: true,
      wasNew: false,
      message: "User already on the waitlist / logged in successfully",
      userId: user._id,
    });

  } catch (error) {
    console.error("Waitlist Join error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An error occurred",
    });
  }
});

// POST /waitlist-join-email
router.post("/waitlist-join-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    let user = await WAITLISTUSER.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user with just email
      user = await WAITLISTUSER.create({
        email: normalizedEmail,
        is_google_user: false, // 👈 mark as normal signup
      });

      return res.status(200).json({
        success: true,
        wasNew: true,
        message: "User added to waitlist successfully",
        userId: user._id,
      });
    }

    // User already exists
    return res.status(200).json({
      success: true,
      wasNew: false,
      message: "User already on the waitlist",
      userId: user._id,
    });

  } catch (error) {
    console.error("Waitlist Join (email) error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An error occurred",
    });
  }
});


router.post("/ask-price", async (req, res) => {
  try {
    const { price } = req.body;

    if (price === undefined || price === null) {
      return res.status(400).json({ success: false, message: "Price is required" });
    }

    const numericPrice = Number(price);
    // Validate allowed prices
    const allowed = [19, 29, 49];
    if (!Number.isFinite(numericPrice) || !allowed.includes(numericPrice)) {
      return res.status(400).json({ success: false, message: "Invalid price. Allowed values: 19, 29, 49" });
    }

    // Save to ASKEDPRICE collection
    // If you have additional fields (email, userId) you can include them here.
    const record = await ASKEDPRICE.create({
      price: numericPrice,
    });

    return res.status(200).json({ success: true, message: "Price saved", id: record._id });
  } catch (err) {
    console.error("Ask price error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});





export default router;
