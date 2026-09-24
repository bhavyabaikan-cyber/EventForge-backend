import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: String
  },
  { timestamps: true }
);

feedbackSchema.index({ attendee: 1, event: 1, session: 1 }, { unique: true, sparse: true });

export default mongoose.model('Feedback', feedbackSchema);
