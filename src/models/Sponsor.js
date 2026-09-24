import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyProfile: String,
    logo: String,
    contactName: String,
    contactEmail: String,
    website: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    assignedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Sponsor', sponsorSchema);
