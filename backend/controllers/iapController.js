import { query } from '../db/connection.js';

export const handleRevenueCatWebhook = async (req, res) => {
    try {
        const event = req.body.event;

        if (!event) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const { type, app_user_id, entitlement_id, expiration_at_ms } = event;

        console.log(`🔔 Webhook received: ${type} for user ${app_user_id}`);

        // Map RC events to our status
        let status = 'active';
        let tier = 'pro';

        // logic based on event type
        // INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, etc.
        if (type === 'EXPIRATION') {
            status = 'expired';
            tier = 'free';
        } else if (type === 'CANCELLATION') {
            // User cancelled but might still have time until expiration
            // We usually keep them pro until expiration date passess
            // For simplicity, we just log it. Real logic should check expiration date.
            status = 'active';
        }

        // Update user in DB
        // precise mapping depends on your entitlement ids
        if (entitlement_id === 'pro_access') {
            tier = (status === 'active') ? 'pro' : 'free';
        }

        await query(
            `UPDATE users 
             SET subscription_tier = $1, 
                 subscription_status = $2, 
                 revenuecat_id = $3
             WHERE id = $4`,
            [tier, status, app_user_id, app_user_id] // Assuming app_user_id IS our internal user ID
        );

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
