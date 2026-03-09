import express from 'express';
import { authMiddleware } from '../server/auth.js';
import {
    getGifts,
    createGift,
    autoGenerateGiftRegistry,
    updateGift,
    deleteGift
} from '../controllers/giftsController.js';
import { requireProTier } from '../middleware/proTierCheck.js';

const router = express.Router();

// Apply auth middleware to all schedule routes
router.use(authMiddleware);

// Gifts CRUD
router.post('/events/:eventId/gifts/generate', requireProTier, autoGenerateGiftRegistry);
router.post('/events/:eventId/gifts', createGift);
router.get('/events/:eventId/gifts', getGifts);
router.put('/events/:eventId/gifts/:giftId', updateGift);
router.delete('/events/:eventId/gifts/:giftId', deleteGift);

export default router;
