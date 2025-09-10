import mongoose from "mongoose";
const { Schema } = mongoose;

// Flair schema
const FlairSchema = new Schema({
  flair_id: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, default: "text" }, // "text" or "richtext"
  mod_only: { type: Boolean, default: false }
});

// Rule schema
const RuleSchema = new Schema({
  short_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  }
});

// Main subreddit schema
const SubRedditSchema = new Schema({
  subreddit: {
    type: String,
    required: true,
    unique: true // one entry per subreddit
  },

  // ✅ Basic Info
  title: { type: String },
  description: { type: String },
  subscribers: { type: Number, default: 0 },
  emojis_enabled: { type: Boolean, default: false },

  // ✅ Flairs
  link_flair_enabled: { type: Boolean, default: false },
  flairs: {
    type: [FlairSchema],
    default: []
  },

  // ✅ Rules
  rules: {
    type: [RuleSchema],
    default: []
  },

   iwillnotpromote_text: {
    type: Boolean,
    default: false
  },


  is_del: {
    type: Boolean,
    default: false
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date
  }
});

const SubReddit_Model = mongoose.model("subreddit_info", SubRedditSchema);
export default SubReddit_Model;
