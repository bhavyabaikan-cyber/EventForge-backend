import QRCode from 'qrcode';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Ticket from '../models/Ticket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ticketCode = () => `EF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const createTicket = async (registration) => {
  const ticketId = ticketCode();
  const qrCode = await QRCode.toDataURL(JSON.stringify({ ticketId, event: registration.event }));
  return Ticket.create({
    attendee: registration.attendee,
    event: registration.event,
    registration: registration._id,
    ticketCategory: registration.ticketCategory,
    ticketId,
    qrCode,
    registrationStatus: registration.status
  });
};

export const listRegistrations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.event) filter.event = req.query.event;
  if (req.user.role === 'attendee') filter.attendee = req.user._id;
  const registrations = await Registration.find(filter).populate('attendee event sessions coupon').sort({ createdAt: -1 });
  res.json(registrations);
});

export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.body.event);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (!['published', 'registration_open'].includes(event.status)) {
    res.status(400);
    throw new Error('Registration is not open for this event');
  }
  const confirmedCount = await Registration.countDocuments({ event: event._id, status: { $in: ['Approved', 'Confirmed'] } });
  const waitlistedCount = await Registration.countDocuments({ event: event._id, status: 'Waitlisted' });
  const status = confirmedCount >= event.capacity ? 'Waitlisted' : 'Confirmed';
  const registration = await Registration.create({
    attendee: req.user._id,
    event: event._id,
    ticketCategory: req.body.ticketCategory,
    sessions: req.body.sessions || [],
    coupon: req.body.coupon,
    status,
    waitlistPosition: status === 'Waitlisted' ? waitlistedCount + 1 : undefined
  });
  const ticket = status === 'Confirmed' ? await createTicket(registration) : null;
  res.status(201).json({ registration, ticket });
});

export const updateRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  let ticket = await Ticket.findOne({ registration: registration._id });
  if (registration.status === 'Confirmed' && !ticket) ticket = await createTicket(registration);
  res.json({ registration, ticket });
});
