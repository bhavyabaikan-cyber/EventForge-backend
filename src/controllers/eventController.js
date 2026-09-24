import Event from '../models/Event.js';
import Organization from '../models/Organization.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const eventFilter = (req) => {
  if (req.user.role === 'platform_admin') return {};
  if (req.user.role === 'event_organizer') return { organizer: req.user._id };
  if (req.user.eventAccess?.length) return { _id: { $in: req.user.eventAccess } };
  return { status: { $in: ['published', 'registration_open', 'ongoing'] } };
};

export const listEvents = asyncHandler(async (req, res) => {
  const events = await Event.find(eventFilter(req)).populate('venue organization organizer', 'name address email').sort({ startDate: 1 });
  res.json(events);
});

export const createEvent = asyncHandler(async (req, res) => {
  let organization = req.body.organization || req.user.organization;
  if (!organization) {
    const fallback = await Organization.findOneAndUpdate(
      { contactEmail: req.user.email },
      { $setOnInsert: { name: `${req.user.name}'s Workspace`, contactEmail: req.user.email, plan: 'growth' } },
      { new: true, upsert: true }
    );
    organization = fallback._id;
  }

  const event = await Event.create({
    ...req.body,
    organizer: req.user._id,
    organization
  });
  res.status(201).json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (req.user.role !== 'platform_admin' && String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the organizer can modify this event');
  }
  Object.assign(event, req.body);
  await event.save();
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (req.user.role !== 'platform_admin' && String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the organizer can delete this event');
  }
  await event.deleteOne();
  res.json({ message: 'Event deleted' });
});

export const publishEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { status: req.body.published ? 'published' : 'draft' }, { new: true });
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  res.json(event);
});
