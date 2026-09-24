import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    photo: String,
    jobTitle: String,
    company: String,
    biography: String,
    expertise: [{ type: String }],
    socialLinks: {
      linkedin: String,
      x: String,
      website: String
    },
    email: { type: String, required: true },
    availability: [{ date: Date, from: String, to: String }],
    presentationMaterial: [{ title: String, url: String }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
  },
  { timestamps: true }
);

export default mongoose.model('Speaker', speakerSchema);
