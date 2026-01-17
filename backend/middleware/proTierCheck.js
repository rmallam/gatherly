/**
 * Middleware to check if user has Pro subscription
 */
export const requireProTier = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.subscription_tier !== 'pro' && req.user.subscription_tier !== 'premium') {
        return res.status(403).json({
            error: 'Pro subscription required',
            feature: 'AI Budget Assistant',
            upgradeUrl: '/pro',
            message: 'Upgrade to Pro to access AI-powered budget recommendations'
        });
    }

    next();
};
