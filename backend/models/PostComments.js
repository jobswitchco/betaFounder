import mongoose from 'mongoose';
const { Schema } = mongoose;


const PostComments_Schema = new Schema({

    user_id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "users",
         },

comment_id: { type: String, unique: true, index: true },  // 👈 unique constraint
  post_id: String,
  parent_id: String,
  depth: Number,

  subreddit: String,
  author: String,
  author_fullname: String,
  is_submitter: Boolean,

  body: String,
  body_html: String,
  ups: Number,
  score: Number,
  created_utc: Date,
  permalink: String,

  category: { type: String, default: "uncategorized" },
  sentiment: { type: String, default: "unknown" },
  analyzedBy: { type: String, default: "heuristic" },

  createdAt: { type: Date, default: Date.now }
});


const PostComments_Schema_Model = mongoose.model('post_comments', PostComments_Schema);
export default PostComments_Schema_Model;
