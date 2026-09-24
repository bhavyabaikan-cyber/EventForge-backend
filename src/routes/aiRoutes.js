import express from 'express';
import { generateContent, recommendSessions } from '../controllers/aiController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/generate', authorize('platform_admin', 'event_organizer'), generateContent);
router.post('/recommend-sessions', authorize('attendee', 'platform_admin'), recommendSessions);

export default router;
