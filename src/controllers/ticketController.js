import Attendance from '../models/Attendance.js';
import Ticket from '../models/Ticket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listTickets = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.event) filter.event = req.query.event;
  if (req.user.role === 'attendee') filter.attendee = req.user._id;
  const tickets = await Ticket.find(filter).populate('attendee event registration').sort({ createdAt: -1 });
  res.json(tickets);
});

export const validateTicket = asyncHandler(async (req, res) => {
  const { ticketId, event } = req.body;
  const ticket = await Ticket.findOne({ ticketId }).populate('attendee event');
  if (!ticket) return res.status(404).json({ status: 'invalid', message: 'Invalid ticket' });
  if (String(ticket.event._id) !== String(event)) return res.status(400).json({ status: 'wrong_event', message: 'Ticket belongs to another event' });
  if (ticket.checkedInAt) return res.status(409).json({ status: 'already_checked_in', message: 'Attendee is already checked in', ticket });

  ticket.checkedInAt = new Date();
  ticket.checkedInBy = req.user._id;
  await ticket.save();
  await Attendance.create({ attendee: ticket.attendee._id, event: ticket.event._id, ticket: ticket._id, checkedInBy: req.user._id });
  res.json({ status: 'valid', message: 'Check-in successful', ticket });
});
