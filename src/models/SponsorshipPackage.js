import mongoose from 'mongoose';

const sponsorshipPackageSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze'], required: true },
    price: { type: Number, required: true, min: 0 },
    benefits: [{ type: String }],
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' },
    allocatedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('SponsorshipPackage', sponsorshipPackageSchema);
