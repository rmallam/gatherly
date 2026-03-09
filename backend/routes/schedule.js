import express from 'express';
import { authMiddleware } from '../server/auth.js';
import {
    createScheduleItem,
    getScheduleItems,
    getScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    autoGenerateSchedule
} from '../controllers/scheduleController.js';
import { requireProTier } from '../middleware/proTierCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Schedule CRUD
router.post('/events/:eventId/schedule/generate', requireProTier, autoGenerateSchedule);
router.post('/events/:eventId/schedule', createScheduleItem);
router.get('/events/:eventId/schedule', getScheduleItems);
router.get('/events/:eventId/schedule/:itemId', getScheduleItem);
router.put('/events/:eventId/schedule/:itemId', updateScheduleItem);
router.delete('/events/:eventId/schedule/:itemId', deleteScheduleItem);

export default router;
