import mongoose from 'mongoose';

const sponsorshipDeliverableSchema = new mongoose.Schema(
  {
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'SponsorshipPackage', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true },
    dueDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Submitted', 'Approved', 'Completed'],
      default: 'Pending'
    },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model('SponsorshipDeliverable', sponsorshipDeliverableSchema);
