import mongoose from "mongoose";
const { Schema } = mongoose;

const AskedPricing_Schema = new Schema({
  

  price: {
    type: Number,
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

const AskedPricing_Schema_Model = mongoose.model("asked_pricing", AskedPricing_Schema);
export default AskedPricing_Schema_Model;
