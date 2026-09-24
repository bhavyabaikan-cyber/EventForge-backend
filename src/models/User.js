import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const roles = ['platform_admin', 'event_organizer', 'event_staff', 'speaker', 'attendee', 'sponsor'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: roles, default: 'attendee' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    eventAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    interests: [{ type: String, trim: true }],
    phone: String,
    avatar: String,
    status: { type: String, enum: ['active', 'inactive', 'invited'], default: 'active' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
