import express from 'express';
import { createSession, deleteSession, listSessions, updateSession } from '../controllers/sessionController.js';
import { authorize, canAccessEvent, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(canAccessEvent((req) => req.query.event), listSessions).post(authorize('platform_admin', 'event_organizer'), canAccessEvent((req) => req.body.event), createSession);
router.route('/:id').put(authorize('platform_admin', 'event_organizer'), updateSession).delete(authorize('platform_admin', 'event_organizer'), deleteSession);

export default router;
