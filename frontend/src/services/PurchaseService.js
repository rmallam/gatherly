import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

// RevenueCat Public API Keys
// REPLACE THESE WITH YOUR ACTUAL KEYS FROM REVENUECAT DASHBOARD
const API_KEYS = {
    ios: 'appl_REPLACE_WITH_YOUR_IOS_KEY',
    android: 'goog_REPLACE_WITH_YOUR_ANDROID_KEY'
};

class PurchaseService {
    constructor() {
        this.isInitialized = false;
        this.currentOffering = null;
        this.customerInfo = null;
    }

    async initialize(userId) {
        if (this.isInitialized) return;

        try {
            // Pick the key based on platform (this is simplified logic, in Capacitor, Purchases handles it if configured)
            // But usually we pass the specific key
            // For Capacitor, we typically set up for both or detect platform
            let apiKey = API_KEYS.ios; // Default fallback
            // Note: Simple platform check isn't strictly needed if we just try one, but good practice

            // Debug logs
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

            // Configure
            // In a real app, you might want to detect Platform using @capacitor/core
            // For now, we'll placeholder this. 
            // IMPORTANT: User must set their keys.
            if (window.Capacitor && window.Capacitor.isNative) {
                if (window.Capacitor.getPlatform() === 'ios') apiKey = API_KEYS.ios;
                else if (window.Capacitor.getPlatform() === 'android') apiKey = API_KEYS.android;

                await Purchases.configure({ apiKey, appUserID: userId });
                this.isInitialized = true;

                // Load initial info
                await this.updateCustomerInfo();
            } else {
                console.warn('RevenueCat: Not running on native device. Purchases will be simulated.');
            }
        } catch (error) {
            console.error('RevenueCat Init Error:', error);
        }
    }

    async updateCustomerInfo() {
        try {
            const info = await Purchases.getCustomerInfo();
            this.customerInfo = info;
            return info;
        } catch (error) {
            console.error('Error fetching customer info:', error);
            return null;
        }
    }

    async getOfferings() {
        try {
            if (!this.isInitialized) return null;

            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null) {
                this.currentOffering = offerings.current;
            }
            return this.currentOffering;
        } catch (error) {
            console.error('Error fetching offerings:', error);
            return null;
        }
    }

    async purchasePackage(pkg) {
        try {
            const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
            this.customerInfo = customerInfo;
            return customerInfo;
        } catch (error) {
            if (!error.userCancelled) {
                console.error('Purchase error:', error);
                throw error;
            } else {
                console.log('User cancelled purchase');
                throw new Error('User cancelled');
            }
        }
    }

    async restorePurchases() {
        try {
            const { customerInfo } = await Purchases.restorePurchases();
            this.customerInfo = customerInfo;
            return customerInfo;
        } catch (error) {
            console.error('Restore error:', error);
            throw error;
        }
    }

    // Check if user has active entitlement
    async checkEntitlement(entitlementId = 'pro') {
        if (!this.customerInfo) await this.updateCustomerInfo();

        return (
            this.customerInfo?.entitlements?.active?.[entitlementId] !== undefined
        );
    }
}

export default new PurchaseService();
