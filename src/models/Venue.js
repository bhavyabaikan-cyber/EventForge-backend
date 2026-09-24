import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    building: String,
    address: { type: String, required: true },
    roomNumber: String,
    capacity: { type: Number, required: true, min: 1 },
    facilities: [{ type: String }],
    availability: { type: String, enum: ['available', 'unavailable', 'maintenance'], default: 'available' },
    description: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
  },
  { timestamps: true }
);

export default mongoose.model('Venue', venueSchema);
