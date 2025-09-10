import mongoose from "mongoose";
const { Schema } = mongoose;

const WaitlistUser_Schema = new Schema({
  
  
    email: {
    type: String,
    required: true,
  },

  name: {
    type: String,
  },

  picture: {
    type: String,
  },

  is_del: {
    type: Boolean,
    default: false,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
  },
});

const WaitlistUser_Schema_Model = mongoose.model("waitlist_users", WaitlistUser_Schema);
export default WaitlistUser_Schema_Model;
