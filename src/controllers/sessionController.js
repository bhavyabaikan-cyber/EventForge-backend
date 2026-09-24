import Event from '../models/Event.js';
import Session from '../models/Session.js';
import Venue from '../models/Venue.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const minutes = (value) => {
  const [hours, mins] = String(value).split(':').map(Number);
  return hours * 60 + mins;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => minutes(aStart) < minutes(bEnd) && minutes(bStart) < minutes(aEnd);

const assertNoRoomConflict = async ({ venue, date, startTime, endTime, ignoreId }) => {
  if (!venue) return;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const sessions = await Session.find({ venue, date: { $gte: start, $lt: end }, _id: { $ne: ignoreId } });
  const conflict = sessions.find((session) => overlaps(startTime, endTime, session.startTime, session.endTime));
  if (conflict) {
    const error = new Error(`Room conflict with session "${conflict.title}"`);
    error.statusCode = 409;
    throw error;
  }
};

const ensureSessionVenue = async (body, user) => {
  if (body.venue) return body.venue;

  const event = await Event.findById(body.event).select('organization capacity venue name');
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  if (event.venue) return event.venue;

  const organization = event.organization || user.organization;
  const venue = await Venue.findOneAndUpdate(
    { name: 'Main Room', organization },
    {
      $setOnInsert: {
        name: 'Main Room',
        building: 'EventForge Workspace',
        address: 'Default event venue',
        roomNumber: 'MAIN',
        capacity: Math.max(Number(body.capacity || event.capacity || 50), 1),
        facilities: ['General session room'],
        organization
      }
    },
    { new: true, upsert: true }
  );

  return venue._id;
};

export const listSessions = asyncHandler(async (req, res) => {
  const query = req.query.event ? { event: req.query.event } : {};
  const sessions = await Session.find(query).populate('event speaker venue').sort({ date: 1, startTime: 1 });
  res.json(sessions);
});

export const createSession = asyncHandler(async (req, res) => {
  const body = { ...req.body, venue: await ensureSessionVenue(req.body, req.user) };
  await assertNoRoomConflict(body);
  const session = await Session.create(body);
  res.status(201).json(session);
});

export const updateSession = asyncHandler(async (req, res) => {
  const current = await Session.findById(req.params.id);
  if (!current) {
    res.status(404);
    throw new Error('Session not found');
  }
  const body = { ...req.body };
  if (!body.venue && !current.venue) body.venue = await ensureSessionVenue({ ...current.toObject(), ...body }, req.user);
  const merged = { ...current.toObject(), ...body, ignoreId: current._id };
  await assertNoRoomConflict(merged);
  Object.assign(current, body);
  await current.save();
  res.json(current);
});

export const deleteSession = asyncHandler(async (req, res) => {
  const deleted = await Session.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error('Session not found');
  }
  res.json({ message: 'Session deleted' });
});
