import express from 'express';
import { createEvent, deleteEvent, listEvents, publishEvent, updateEvent } from '../controllers/eventController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(listEvents).post(authorize('platform_admin', 'event_organizer'), createEvent);
router.route('/:id').put(authorize('platform_admin', 'event_organizer'), updateEvent).delete(authorize('platform_admin', 'event_organizer'), deleteEvent);
router.patch('/:id/publish', authorize('platform_admin', 'event_organizer'), publishEvent);

export default router;
