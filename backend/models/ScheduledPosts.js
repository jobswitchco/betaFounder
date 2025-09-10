import mongoose from 'mongoose';
const { Schema } = mongoose;


const ScheduledPosts_Schema = new Schema({

    user_id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "users",
         },

      post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "generated_posts",
  },
        campaign_id: String,
       publish_at: {
        type: Date
       },
       post_status: String,

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


const ScheduledPosts_Schema_Model = mongoose.model('scheduled_posts', ScheduledPosts_Schema);
export default ScheduledPosts_Schema_Model;
