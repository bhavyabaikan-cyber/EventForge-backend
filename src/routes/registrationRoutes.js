import express from 'express';
import { listRegistrations, registerForEvent, updateRegistration } from '../controllers/registrationController.js';
import { authorize, canAccessEvent, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(canAccessEvent((req) => req.query.event), listRegistrations).post(authorize('attendee', 'platform_admin'), registerForEvent);
router.patch('/:id', authorize('platform_admin', 'event_organizer'), updateRegistration);

export default router;
