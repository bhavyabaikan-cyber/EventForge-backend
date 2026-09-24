import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    ticketCategory: String,
    ticketId: { type: String, required: true, unique: true },
    qrCode: String,
    registrationStatus: String,
    checkedInAt: Date,
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);
