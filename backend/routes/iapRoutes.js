const express = require('express');
const router = express.Router();
const iapController = require('../controllers/iapController');

// Define webhook route
// POST /api/webhooks/revenuecat
router.post('/revenuecat', iapController.handleRevenueCatWebhook);

module.exports = router;
