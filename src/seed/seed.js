import dotenv from 'dotenv';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { connectDB } from '../config/db.js';
import Announcement from '../models/Announcement.js';
import Attendance from '../models/Attendance.js';
import Coupon from '../models/Coupon.js';
import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';
import Organization from '../models/Organization.js';
import Registration from '../models/Registration.js';
import Session from '../models/Session.js';
import Speaker from '../models/Speaker.js';
import Sponsor from '../models/Sponsor.js';
import SponsorshipDeliverable from '../models/SponsorshipDeliverable.js';
import SponsorshipPackage from '../models/SponsorshipPackage.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Venue from '../models/Venue.js';

dotenv.config();

const collections = [
  Attendance,
  Feedback,
  Ticket,
  Registration,
  SponsorshipDeliverable,
  SponsorshipPackage,
  Sponsor,
  Session,
  Announcement,
  Coupon,
  Speaker,
  Event,
  Venue,
  User,
  Organization
];

const run = async () => {
  await connectDB();
  await Promise.all(collections.map((model) => model.deleteMany({})));

  const [acme, nova] = await Organization.create([
    { name: 'Acme Global Events', industry: 'Event Agency', website: 'https://acme.example', contactEmail: 'ops@acme.example', plan: 'enterprise' },
    { name: 'NovaTech Systems', industry: 'Enterprise Software', website: 'https://novatech.example', contactEmail: 'events@novatech.example', plan: 'growth' }
  ]);

  const users = await User.create([
    { name: 'Priya Admin', email: 'admin@eventforge.test', password: 'Password123', role: 'platform_admin', organization: acme._id },
    { name: 'Omar Organizer', email: 'organizer@eventforge.test', password: 'Password123', role: 'event_organizer', organization: acme._id },
    { name: 'Maya Staff', email: 'staff@eventforge.test', password: 'Password123', role: 'event_staff', organization: acme._id },
    { name: 'Dr. Elena Speaker', email: 'speaker@eventforge.test', password: 'Password123', role: 'speaker', organization: acme._id, interests: ['AI', 'Leadership'] },
    { name: 'Ravi Attendee', email: 'attendee@eventforge.test', password: 'Password123', role: 'attendee', organization: nova._id, interests: ['AI', 'Cloud', 'Security'] },
    { name: 'Sara Sponsor', email: 'sponsor@eventforge.test', password: 'Password123', role: 'sponsor', organization: nova._id }
  ]);
  const [admin, organizer, staff, speakerUser, attendee, sponsorUser] = users;

  const [grandHall, studioB, summitRoom] = await Venue.create([
    { name: 'Grand Hall', building: 'Convention Center', address: '100 Market Street, San Francisco', roomNumber: 'A1', capacity: 600, facilities: ['Stage', 'LED wall', 'Green room'], availability: 'available', organization: acme._id },
    { name: 'Studio B', building: 'Innovation Tower', address: '45 Enterprise Way, Austin', roomNumber: 'B12', capacity: 120, facilities: ['Projector', 'Hybrid AV'], availability: 'available', organization: acme._id },
    { name: 'Summit Room', building: 'Executive Campus', address: '9 Boardwalk Plaza, Chicago', roomNumber: '4C', capacity: 220, facilities: ['Roundtables', 'Recording'], availability: 'available', organization: acme._id }
  ]);

  const [forgeSummit, opsForum] = await Event.create([
    {
      name: 'Forge Summit 2026',
      description: 'A corporate conference for enterprise leaders designing resilient digital experiences.',
      eventType: 'Conference',
      category: 'Technology',
      organization: acme._id,
      organizer: organizer._id,
      startDate: new Date('2026-11-12'),
      endDate: new Date('2026-11-14'),
      startTime: '09:00',
      endTime: '17:30',
      venue: grandHall._id,
      capacity: 500,
      registrationDeadline: new Date('2026-11-05'),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      status: 'registration_open',
      tags: ['AI', 'Cloud', 'Security', 'Leadership'],
      contact: { name: 'EventForge Ops', email: 'ops@eventforge.test', phone: '+1 555 0100' },
      staff: [staff._id]
    },
    {
      name: 'Operations Excellence Forum',
      description: 'A compact leadership forum for operations, finance, and customer success teams.',
      eventType: 'Forum',
      category: 'Operations',
      organization: acme._id,
      organizer: organizer._id,
      startDate: new Date('2026-12-04'),
      endDate: new Date('2026-12-04'),
      startTime: '10:00',
      endTime: '16:00',
      venue: summitRoom._id,
      capacity: 180,
      registrationDeadline: new Date('2026-11-27'),
      status: 'published',
      tags: ['Operations', 'CX', 'Analytics'],
      contact: { name: 'Omar Organizer', email: 'organizer@eventforge.test' },
      staff: [staff._id]
    }
  ]);

  await User.updateMany({ _id: { $in: [organizer._id, staff._id, speakerUser._id, sponsorUser._id] } }, { $set: { eventAccess: [forgeSummit._id, opsForum._id] } });

  const speaker = await Speaker.create({
    user: speakerUser._id,
    name: 'Dr. Elena Speaker',
    jobTitle: 'VP of Applied AI',
    company: 'NovaTech Systems',
    biography: 'Elena advises enterprise teams on responsible AI operations and measurable adoption programs.',
    expertise: ['AI strategy', 'Responsible automation', 'Executive enablement'],
    socialLinks: { linkedin: 'https://linkedin.com/in/elena-speaker' },
    email: 'speaker@eventforge.test',
    organization: acme._id,
    presentationMaterial: [{ title: 'AI Operating Model Template', url: 'https://example.com/materials/ai-operating-model' }]
  });

  const sessions = await Session.create([
    { title: 'Opening Keynote: Enterprise AI That Ships', description: 'A leadership keynote on AI products that reach production.', event: forgeSummit._id, speaker: speaker._id, venue: grandHall._id, date: new Date('2026-11-12'), startTime: '09:30', endTime: '10:20', sessionType: 'keynote', capacity: 500, track: 'Leadership', tags: ['AI', 'Strategy'] },
    { title: 'Cloud Resilience Workshop', description: 'Hands-on planning for highly available corporate platforms.', event: forgeSummit._id, speaker: speaker._id, venue: studioB._id, date: new Date('2026-11-12'), startTime: '11:00', endTime: '12:15', sessionType: 'workshop', capacity: 100, track: 'Architecture', tags: ['Cloud', 'Reliability'] },
    { title: 'Security Executive Roundtable', description: 'A practical discussion for security and operations leaders.', event: forgeSummit._id, speaker: speaker._id, venue: summitRoom._id, date: new Date('2026-11-13'), startTime: '14:00', endTime: '15:00', sessionType: 'panel', capacity: 160, track: 'Risk', tags: ['Security', 'Governance'] }
  ]);

  const sponsor = await Sponsor.create({ name: 'NovaTech Systems', companyProfile: 'Enterprise software and cloud operations partner.', contactName: 'Sara Sponsor', contactEmail: 'sponsor@eventforge.test', website: 'https://novatech.example', organization: nova._id, assignedEvents: [forgeSummit._id], user: sponsorUser._id });
  const packageDoc = await SponsorshipPackage.create({ name: 'Gold', price: 25000, benefits: ['Logo placement', 'Expo booth', 'Lead report'], event: forgeSummit._id, sponsor: sponsor._id, allocatedAt: new Date() });
  await SponsorshipDeliverable.create([
    { sponsor: sponsor._id, package: packageDoc._id, event: forgeSummit._id, title: 'Submit booth artwork', dueDate: new Date('2026-10-15'), status: 'In Progress' },
    { sponsor: sponsor._id, package: packageDoc._id, event: forgeSummit._id, title: 'Approve logo placement', dueDate: new Date('2026-10-25'), status: 'Pending' }
  ]);

  const coupon = await Coupon.create({ code: 'FORGE20', event: forgeSummit._id, discountType: 'percentage', discountValue: 20, usageLimit: 50, expiresAt: new Date('2026-11-01') });
  const registration = await Registration.create({ attendee: attendee._id, event: forgeSummit._id, ticketCategory: 'VIP', sessions: [sessions[0]._id, sessions[1]._id], coupon: coupon._id, status: 'Confirmed' });
  const ticketId = 'EF-DEMO-2026-VIP';
  const qrCode = await QRCode.toDataURL(JSON.stringify({ ticketId, event: forgeSummit._id }));
  const ticket = await Ticket.create({ attendee: attendee._id, event: forgeSummit._id, registration: registration._id, ticketCategory: 'VIP', ticketId, qrCode, registrationStatus: 'Confirmed' });
  await Attendance.create({ attendee: attendee._id, event: forgeSummit._id, session: sessions[0]._id, ticket: ticket._id, checkedInBy: staff._id });
  await Feedback.create({ attendee: attendee._id, event: forgeSummit._id, session: sessions[0]._id, rating: 5, comments: 'Strong strategic framing and useful examples.' });
  await Announcement.create([
    { title: 'Registration is open', message: 'Forge Summit registration is open for invited companies and partners.', event: forgeSummit._id, priority: 'Important', targetAudience: ['all'], createdBy: organizer._id },
    { title: 'Speaker material deadline', message: 'Please upload final presentation material by October 28.', event: forgeSummit._id, priority: 'Normal', targetAudience: ['speaker'], createdBy: organizer._id }
  ]);

  console.log('EventForge seed complete');
  console.table([
    ['Platform Admin', 'admin@eventforge.test', 'Password123'],
    ['Organizer', 'organizer@eventforge.test', 'Password123'],
    ['Staff', 'staff@eventforge.test', 'Password123'],
    ['Speaker', 'speaker@eventforge.test', 'Password123'],
    ['Attendee', 'attendee@eventforge.test', 'Password123'],
    ['Sponsor', 'sponsor@eventforge.test', 'Password123']
  ]);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
