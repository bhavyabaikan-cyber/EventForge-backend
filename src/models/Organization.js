import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: String,
    website: String,
    contactEmail: String,
    plan: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'growth' },
    settings: { timezone: String, brandingColor: String }
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);
