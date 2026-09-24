import express from 'express';
import Announcement from '../models/Announcement.js';
import Attendance from '../models/Attendance.js';
import Coupon from '../models/Coupon.js';
import Feedback from '../models/Feedback.js';
import Organization from '../models/Organization.js';
import Speaker from '../models/Speaker.js';
import Sponsor from '../models/Sponsor.js';
import SponsorshipDeliverable from '../models/SponsorshipDeliverable.js';
import SponsorshipPackage from '../models/SponsorshipPackage.js';
import User from '../models/User.js';
import Venue from '../models/Venue.js';
import { createCrudController } from '../controllers/crudController.js';
import { authorize, canAccessEvent, protect } from '../middleware/authMiddleware.js';

const resourceMap = {
  users: { model: User, roles: ['platform_admin'], populate: 'organization eventAccess' },
  organizations: { model: Organization, roles: ['platform_admin'], scoped: false },
  venues: { model: Venue, roles: ['platform_admin', 'event_organizer'] },
  speakers: { model: Speaker, roles: ['platform_admin', 'event_organizer', 'speaker'] },
  sponsors: { model: Sponsor, roles: ['platform_admin', 'event_organizer', 'sponsor'], scoped: false },
  packages: { model: SponsorshipPackage, roles: ['platform_admin', 'event_organizer', 'sponsor'], withOrganization: false, populate: 'event sponsor' },
  deliverables: { model: SponsorshipDeliverable, roles: ['platform_admin', 'event_organizer', 'sponsor'], withOrganization: false, populate: 'event sponsor package' },
  coupons: { model: Coupon, roles: ['platform_admin', 'event_organizer'], withOrganization: false },
  announcements: { model: Announcement, roles: ['platform_admin', 'event_organizer', 'event_staff'], withOrganization: false, createdBy: 'createdBy', populate: 'event createdBy' },
  attendance: { model: Attendance, roles: ['platform_admin', 'event_organizer', 'event_staff', 'attendee'], withOrganization: false, populate: 'attendee event session ticket' },
  feedback: { model: Feedback, roles: ['platform_admin', 'event_organizer', 'attendee'], withOrganization: false, populate: 'attendee event session' }
};

export const makeResourceRouter = (key) => {
  const config = resourceMap[key];
  const controller = createCrudController(config.model, config);
  const router = express.Router();
  router.use(protect);
  const eventScope = ['packages', 'deliverables', 'coupons', 'announcements', 'attendance', 'feedback'].includes(key) ? canAccessEvent((req) => req.query.event || req.body.event) : (req, res, next) => next();
  router.route('/').get(authorize(...config.roles), eventScope, controller.list).post(authorize(...config.roles), eventScope, controller.create);
  router.route('/:id').get(authorize(...config.roles), controller.get).put(authorize(...config.roles), controller.update).delete(authorize(...config.roles), controller.remove);
  return router;
};
