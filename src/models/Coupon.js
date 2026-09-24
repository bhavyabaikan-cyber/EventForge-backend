import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, event: 1 }, { unique: true });

export default mongoose.model('Coupon', couponSchema);
