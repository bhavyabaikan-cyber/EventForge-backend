import Session from '../models/Session.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const templates = {
  event_description: ({ name = 'this event', category = 'corporate innovation' }) =>
    `${name} brings together business leaders, practitioners, and partners for a focused ${category} experience with practical sessions, curated networking, and measurable post-event outcomes.`,
  speaker_biography: ({ name = 'The speaker', jobTitle = 'industry leader', company = 'their organization', expertise = [] }) =>
    `${name} is a ${jobTitle} at ${company}, known for work across ${expertise.join(', ') || 'enterprise transformation'}. Their sessions combine strategic perspective with actionable field experience.`,
  announcement: ({ title = 'Event update', message = 'Please review the latest event details.' }) =>
    `${title}: ${message} Our team will continue sharing timely updates so every attendee has a smooth conference experience.`,
  session_summary: ({ title = 'This session', tags = [] }) =>
    `${title} explores ${tags.join(', ') || 'practical business priorities'} through real examples, audience discussion, and takeaways participants can apply immediately.`
};

export const generateContent = asyncHandler(async (req, res) => {
  const { type, payload = {} } = req.body;
  const generator = templates[type];
  if (!generator) {
    res.status(400);
    throw new Error('Unsupported AI content type');
  }
  res.json({
    provider: process.env.AI_API_KEY ? 'external-ready' : 'deterministic-fallback',
    content: generator(payload)
  });
});

export const recommendSessions = asyncHandler(async (req, res) => {
  const { event, interests = [] } = req.body;
  const registrations = await Registration.find({ attendee: req.user._id }).select('sessions');
  const selected = new Set(registrations.flatMap((item) => item.sessions.map(String)));
  const sessions = await Session.find(event ? { event } : {}).populate('event speaker venue');
  const lowered = interests.concat(req.user.interests || []).map((item) => item.toLowerCase());
  const ranked = sessions
    .filter((session) => !selected.has(String(session._id)))
    .map((session) => {
      const text = [session.title, session.track, ...(session.tags || []), session.event?.category].join(' ').toLowerCase();
      const score = lowered.reduce((sum, interest) => sum + (text.includes(interest) ? 2 : 0), 1);
      return { session, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  res.json(ranked);
});
