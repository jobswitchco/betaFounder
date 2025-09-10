import mongoose from 'mongoose';
  const { Schema } = mongoose;
  
  
  const BestTimeSlots_Schema = new Schema({
  
    subreddit: { type: String, required: true, unique: true }, // e.g., "r/startups"
  slots: {
    type: Map,
    of: [String], // array of time ranges in "HH:mm – HH:mm UTC" format
    required: true,
  },
  updated_at: { type: Date, default: Date.now },
  });
  
  
  const BestTimeSlots_Schema_Model = mongoose.model('best_time_slots', BestTimeSlots_Schema);
  export default BestTimeSlots_Schema_Model;
  