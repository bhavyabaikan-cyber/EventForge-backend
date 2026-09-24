import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createToken, userPayload } from '../utils/token.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'attendee', organization, organizationName, interests = [] } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  let organizationId = organization;
  if (!organizationId && ['event_organizer', 'event_staff', 'speaker', 'sponsor'].includes(role)) {
    const organizationDoc = await Organization.create({
      name: organizationName || `${name}'s Organization`,
      contactEmail: email,
      plan: role === 'event_organizer' ? 'growth' : 'starter'
    });
    organizationId = organizationDoc._id;
  }

  const user = await User.create({ name, email, password, role, organization: organizationId, interests });
  res.status(201).json({ token: createToken(user), user: userPayload(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({ token: createToken(user), user: userPayload(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: userPayload(req.user) });
});
