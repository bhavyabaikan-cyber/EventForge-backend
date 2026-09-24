import mongoose from 'mongoose';

export const eventStatuses = ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'];

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eventType: { type: String, required: true },
    category: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    capacity: { type: Number, required: true, min: 1 },
    registrationDeadline: Date,
    image: String,
    status: { type: String, enum: eventStatuses, default: 'draft' },
    tags: [{ type: String, trim: true }],
    contact: {
      name: String,
      email: String,
      phone: String
    },
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
