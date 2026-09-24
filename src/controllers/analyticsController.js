import Attendance from '../models/Attendance.js';
import Feedback from '../models/Feedback.js';
import Registration from '../models/Registration.js';
import Session from '../models/Session.js';
import SponsorshipDeliverable from '../models/SponsorshipDeliverable.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analyticsOverview = asyncHandler(async (req, res) => {
  const eventFilter = req.query.event ? { event: req.query.event } : {};
  const [total, confirmed, waitlisted, attended, sessions, feedback, deliverables, registrations] = await Promise.all([
    Registration.countDocuments(eventFilter),
    Registration.countDocuments({ ...eventFilter, status: 'Confirmed' }),
    Registration.countDocuments({ ...eventFilter, status: 'Waitlisted' }),
    Attendance.countDocuments(eventFilter),
    Session.find(eventFilter).select('title capacity tags'),
    Feedback.find(eventFilter).select('rating session'),
    SponsorshipDeliverable.find(eventFilter).select('status sponsor'),
    Registration.find(eventFilter).select('ticketCategory sessions status createdAt')
  ]);

  const sessionPopularity = sessions.map((session) => ({
    name: session.title,
    attendees: registrations.filter((reg) => reg.sessions.map(String).includes(String(session._id))).length
  }));
  const ticketCategoryDistribution = Object.values(registrations.reduce((acc, reg) => {
    acc[reg.ticketCategory] = acc[reg.ticketCategory] || { name: reg.ticketCategory, value: 0 };
    acc[reg.ticketCategory].value += 1;
    return acc;
  }, {}));
  const ratingAverage = feedback.length ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length : 0;
  const sponsorPerformance = Object.values(deliverables.reduce((acc, item) => {
    const status = item.status;
    acc[status] = acc[status] || { name: status, value: 0 };
    acc[status].value += 1;
    return acc;
  }, {}));
  const registrationTrends = Object.values(registrations.reduce((acc, reg) => {
    const key = reg.createdAt.toISOString().slice(0, 10);
    acc[key] = acc[key] || { date: key, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {}));

  res.json({
    totals: {
      registrations: total,
      confirmed,
      waitlisted,
      attendancePercentage: confirmed ? Math.round((attended / confirmed) * 100) : 0,
      feedbackAverage: Number(ratingAverage.toFixed(1))
    },
    sessionPopularity,
    ticketCategoryDistribution,
    sponsorPerformance,
    registrationTrends
  });
});
