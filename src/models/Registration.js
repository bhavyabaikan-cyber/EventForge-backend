import mongoose from 'mongoose';

export const registrationStates = ['Pending', 'Approved', 'Rejected', 'Waitlisted', 'Cancelled', 'Confirmed'];

const registrationSchema = new mongoose.Schema(
  {
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketCategory: { type: String, enum: ['General', 'VIP', 'Executive', 'Student'], default: 'General' },
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    status: { type: String, enum: registrationStates, default: 'Pending' },
    waitlistPosition: Number,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

registrationSchema.index({ attendee: 1, event: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
