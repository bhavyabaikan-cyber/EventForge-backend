import express from 'express';
import { listTickets, validateTicket } from '../controllers/ticketController.js';
import { authorize, canAccessEvent, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', listTickets);
router.post('/validate', authorize('platform_admin', 'event_staff', 'event_organizer'), canAccessEvent((req) => req.body.event), validateTicket);

export default router;
