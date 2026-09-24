import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    checkInTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['checked_in', 'late', 'absent'], default: 'checked_in' },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

attendanceSchema.index({ attendee: 1, event: 1, session: 1 }, { unique: true, sparse: true });

export default mongoose.model('Attendance', attendanceSchema);
