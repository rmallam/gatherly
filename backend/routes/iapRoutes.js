import express from 'express';
import * as iapController from '../controllers/iapController.js';

const router = express.Router();

// Define webhook route
// POST /api/webhooks/revenuecat
router.post('/revenuecat', iapController.handleRevenueCatWebhook);

export default router;
