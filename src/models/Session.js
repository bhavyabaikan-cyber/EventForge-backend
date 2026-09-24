import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    sessionType: { type: String, enum: ['keynote', 'workshop', 'panel', 'breakout', 'networking'], default: 'breakout' },
    capacity: { type: Number, required: true, min: 1 },
    track: String,
    tags: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
