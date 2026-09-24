import express from 'express';
import { analyticsOverview } from '../controllers/analyticsController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('platform_admin', 'event_organizer', 'event_staff', 'sponsor'), analyticsOverview);

export default router;
