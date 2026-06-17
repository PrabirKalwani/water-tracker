import mongoose from 'mongoose';

const daySchema = new mongoose.Schema({
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
}, { _id: false });

const waterSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  goal: { type: Number, default: 8 },
  ml: { type: Number, default: 250 },
  days: [daySchema],
});

export default mongoose.model('Water', waterSchema);
