import mongoose from 'mongoose';
const { Schema } = mongoose;


const PublishedPosts_Schema = new Schema({

    user_id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "users",
         },

         subreddit: String,
         title: String,
         text: String,
         url: String,
         redditPostId: String,
         redditPermalink: String,
         kind: String,

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


const PublishedPosts_Schema_Model = mongoose.model('published_posts', PublishedPosts_Schema);
export default PublishedPosts_Schema_Model;
