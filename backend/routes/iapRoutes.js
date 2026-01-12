import express from 'express';
import * as iapController from '../controllers/iapController.js';

const router = express.Router();

// Define webhook route
// POST /api/iap/webhook
router.post('/webhook', iapController.handleRevenueCatWebhook);

export default router;
