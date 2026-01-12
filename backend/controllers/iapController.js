import { query } from '../db/connection.js';

export const handleRevenueCatWebhook = async (req, res) => {
    try {
        const event = req.body.event;

        // Security Check: Verify Auth Token
        const authHeader = req.headers.authorization;
        const expectedToken = process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN;

        // Only check if env var is set (allows easier testing if needed, though not recommended for prod)
        if (expectedToken && authHeader !== expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            console.warn('⚠️ Webhook Unauthorized: Invalid Token');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!event) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const { type, app_user_id, entitlement_id, expiration_at_ms } = event;

        console.log(`🔔 Webhook received: ${type} for user ${app_user_id}`);

        // Map RC events to our status
        let status = 'active';
        let tier = 'pro';

        // logic based on event type
        if (type === 'EXPIRATION') {
            status = 'expired';
            tier = 'free';
        } else if (type === 'CANCELLATION') {
            status = 'active'; // Cancelled but still active until auto-renew date passes (technically)
        }

        // Update user in DB
        // For now, we assume any active entitlement means PRO (since we only have one tier)
        if (entitlement_id && entitlement_id !== 'pro_access') {
            console.log(`ℹ️ Note: Entitlement ID '${entitlement_id}' differs from expected 'pro_access', but processing as PRO.`);
        }

        // Grant 250 SMS credits if upgrading to Pro
        let smsCreditsUpdate = '';
        if (tier === 'pro') {
            smsCreditsUpdate = ', sms_credits = 250';
        } else {
            // Optional: Reset to 0 or keep remaining? 
            // Usually valid to keep them or set to a free limit. 
            // Setting to 0 for now as per "add some SMS for the pro tier" implication.
            smsCreditsUpdate = ', sms_credits = 0';
        }

        // Handle Consumable SMS Packs (Non-Renewing)
        // Check product_id from the event
        const productId = event?.product_id;
        if (productId) {
            let creditsToAdd = 0;
            if (productId.includes('sms_100')) creditsToAdd = 100;
            if (productId.includes('sms_300')) creditsToAdd = 300;
            if (productId.includes('sms_500')) creditsToAdd = 500;

            if (creditsToAdd > 0) {
                console.log(`💰 Consumable Purchase: Adding ${creditsToAdd} credits for user ${app_user_id}`);
                const creditResult = await query(
                    'UPDATE users SET sms_credits = sms_credits + $1 WHERE id = $2 RETURNING sms_credits',
                    [creditsToAdd, app_user_id]
                );
                console.log(`✅ New Credit Balance: ${creditResult.rows[0]?.sms_credits}`);
                // Return early as we don't want to mess with subscription tier for a consumable
                return res.status(200).json({ message: 'Credits added' });
            }
        }

        const result = await query(
            `UPDATE users 
             SET subscription_tier = $1, 
                 subscription_status = $2, 
                 revenuecat_id = $3
                 ${smsCreditsUpdate}
             WHERE id = $4 
             RETURNING id, email, subscription_tier, sms_credits`,
            [tier, status, app_user_id, app_user_id]
        );

        if (result.rowCount === 0) {
            console.warn(`⚠️ Webhook Warning: User ${app_user_id} not found in DB. Update skipped.`);
        } else {
            console.log(`✅ User ${result.rows[0].email} updated to ${tier} (Credits: ${result.rows[0].sms_credits})`);
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
