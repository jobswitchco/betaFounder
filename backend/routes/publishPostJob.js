import ScheduledPosts from "../models/ScheduledPosts.js";
import USER from "../models/RedditUser.js";
import RequestLog from "../models/RequestLog.js";
import GeneratedPosts from "../models/GeneratedPosts.js";
import SubRedditRules_Model from "../models/SubRedditRules.js";
import PublishedPosts from "../models/PublishedPosts.js";
import axios from "axios";


const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

const sleepChill = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function getValidAccessToken(userId) {
  const now = Math.floor(Date.now() / 1000); // seconds

  // 1. Fetch user from DB
  const user = await USER.findById(userId);
  if (!user) {
    throw new Error(`User not found with id: ${userId}`);
  }

  // 2. If token is still valid, return it
  if (
    user.access_token &&
    user.accessToken_expires_in &&
    user.accessToken_expires_in > now
  ) {
    return user.access_token;
  }

  // 3. Otherwise, refresh using refresh_token
  try {
    const basicAuth = Buffer.from(
      `${CLIENT_ID}:${CLIENT_SECRET}`
    ).toString("base64");

    const res = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: user.refresh_token,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "server:ValidateIt/1.0.0 (by u/techieram7_)", 
        },
      }
    );
    const { access_token, expires_in } = res.data;

    // 4. Update DB with fresh token + expiry
    user.access_token = access_token;
    user.accessToken_expires_in = expires_in;
    await user.save();

    // 5. Return new access_token
    return access_token;
  } catch (err) {
    console.error(
      "❌ Error refreshing Reddit token:",
      err.response?.data || err.message
    );
    throw err;
  }
}

async function checkRequestWindow(service = "reddit", limit = 60, windowSeconds = 60) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  // 1. Get recent requests in the rolling window
  const recentRequests = await RequestLog.find({
    service,
    timestamp: { $gte: windowStart }
  })
    .sort({ timestamp: 1 }) // oldest first
    .lean();

  // 2. If under limit → allow and log new request
  if (recentRequests.length < limit) {
    await RequestLog.create({ service, timestamp: now });
    return { allow: true };
  }

  // 3. If over limit → block and calculate wait time
  const oldest = recentRequests[0];
  const nextAvailable = new Date(oldest.timestamp.getTime() + windowSeconds * 1000);
  const waitTime = Math.ceil((nextAvailable - now) / 1000);

  return { allow: false, waitTime };
}


export const definePublishJob = (agenda) => {
  agenda.define("publish scheduled post", async (job, done) => {
    const { scheduledPostId, user_id } = job.attrs.data;

    try {
      // 1. Load scheduled post
      const scheduledPost = await ScheduledPosts.findById(scheduledPostId);
      if (!scheduledPost) throw new Error("Scheduled post not found");

      // 2. Load generated post
      const generatedPost = await GeneratedPosts.findById(scheduledPost.post_id);
      if (!generatedPost) throw new Error("Generated post not found");

      // 3. Load user
      const user = await USER.findById(user_id);
      if (!user) throw new Error("User not found");

      const subreddit = generatedPost.sub_reddit.replace(/^r\//i, "");
      const title = generatedPost.post_title;
      const text = generatedPost.post_content || null;
      const url = null; // extend later if needed

      // 4. Get fresh access token
      const accessToken = await getValidAccessToken(user_id);

      // 5. Base payload
      const payload = {
        sr: subreddit,
        title,
        api_type: "json",
      };
      if (text) {
        payload.kind = "self";
        payload.text = text;
      } else if (url) {
        payload.kind = "link";
        payload.url = url;
      }

      // 6. Pick flair from DB (if available)
      const dbSub = await SubRedditRules_Model.findOne({
        subreddit: `r/${subreddit}`,
      });

      if (dbSub?.flairs?.length > 0) {
        const chosenFlair =
          dbSub.flairs[Math.floor(Math.random() * dbSub.flairs.length)];
        console.log(
          `🎯 Applying cached flair "${chosenFlair.text}" automatically`
        );
        payload.flair_id = chosenFlair.flair_id;
      } else {
        console.log(
          `ℹ️ No cached flairs for r/${subreddit}. Posting without flair`
        );
      }

      // 7. Throttle check
      while (true) {
        const throttle = await checkRequestWindow("reddit");
        if (throttle.allow) break;
        console.log(`⏳ Rate limit hit. Waiting ${throttle.waitTime}s...`);
        await sleepChill(throttle.waitTime * 1000);
      }

      // Helper to submit to Reddit
      const submitToReddit = async (payload) => {
        return axios.post(
          "https://oauth.reddit.com/api/submit",
          new URLSearchParams(payload).toString(),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "server:ValidateIt/1.0.0 (by u/techieram7_)",
            },
          }
        );
      };

      // 8. Submit with flair (if we had one)
      let res = await submitToReddit(payload);
      let responseData = res.data;

      // 9. Save published post
      if (responseData?.json?.data?.id) {
        const redditPostId = responseData.json.data.id;
        const redditPermalink =
          responseData.json.data.url ||
          `https://reddit.com${responseData.json.data.permalink}`;

        const savedPost = await PublishedPosts.create({
          user_id,
          subreddit,
          title,
          text,
          url,
          redditPostId,
          redditPermalink,
          kind: text ? "self" : "link",
        });

        console.log("✅ Post saved to PublishedPosts:", savedPost._id);

        await ScheduledPosts.findByIdAndUpdate(scheduledPostId, {
          post_status: "published",
          updated_at: new Date(),
        });
      } else {
        console.warn(
          "⚠️ Reddit response missing post ID:",
          responseData.json.errors
        );
      }

      done();
    } catch (err) {
      console.error(
        "❌ Error publishing post:",
        err?.response?.data || err.message
      );

      await ScheduledPosts.findByIdAndUpdate(job.attrs.data.scheduledPostId, {
        post_status: "errored",
        updated_at: new Date(),
      });

      done(err);
    }
  });
};
    



