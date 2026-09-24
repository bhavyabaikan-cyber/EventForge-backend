import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' },
    targetAudience: [{ type: String, enum: ['all', 'attendee', 'speaker', 'sponsor', 'staff'] }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
