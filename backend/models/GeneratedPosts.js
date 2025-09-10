import mongoose from 'mongoose';
const { Schema } = mongoose;


const GeneratedPosts_Schema = new Schema({

    user_id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "users",
         },

         campaign_id: String,
         post_title: String,
         post_content: String,
         sub_reddit: String,

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


const GeneratedPosts_Schema_Model = mongoose.model('generated_posts', GeneratedPosts_Schema);
export default GeneratedPosts_Schema_Model;
