import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// RevenueCat Public API Keys
// REPLACE THESE WITH YOUR ACTUAL KEYS FROM REVENUECAT DASHBOARD
const API_KEYS = {
    ios: 'test_hCYotXJVQWhqPsGwddNQDlSiUGm',
    android: 'test_hCYotXJVQWhqPsGwddNQDlSiUGm'
};

class PurchaseService {
    constructor() {
        this.isInitialized = false;
        this.currentOffering = null;
        this.customerInfo = null;
    }

    async initialize(userId) {
        if (this.isInitialized) {
            console.log('💰 RevenueCat already initialized');
            return;
        }

        console.log('💰 Initializing RevenueCat for user:', userId);

        try {
            // Pick the key based on platform (this is simplified logic, in Capacitor, Purchases handles it if configured)
            // But usually we pass the specific key
            // For Capacitor, we typically set up for both or detect platform
            let apiKey = API_KEYS.ios; // Default fallback
            // Note: Simple platform check isn't strictly needed if we just try one, but good practice

            // Debug logs
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

            const isNative = Capacitor.isNativePlatform();
            console.log('💰 Platform Check. isNativePlatform():', isNative, 'Platform:', Capacitor.getPlatform());

            if (isNative) {
                if (Capacitor.getPlatform() === 'ios') apiKey = API_KEYS.ios;
                else if (Capacitor.getPlatform() === 'android') apiKey = API_KEYS.android;

                console.log('💰 Configuring Purchases with API Key:', apiKey);
                await Purchases.configure({ apiKey, appUserID: userId });
                this.isInitialized = true;
                console.log('💰 RevenueCat Configured Successfully');

                // Load initial info
                await this.updateCustomerInfo();
            } else {
                console.warn('RevenueCat: Not running on native device. Purchases will be simulated.');
            }
        } catch (error) {
            console.error('💰 RevenueCat Init Error:', error);
        }
    }

    async updateCustomerInfo() {
        try {
            const info = await Purchases.getCustomerInfo();
            this.customerInfo = info;
            console.log('💰 Customer Info Refreshed:', info);
            return info;
        } catch (error) {
            console.error('Error fetching customer info:', error);
            return null;
        }
    }

    async getOfferings() {
        try {
            console.log('💰 getOfferings called. Initialized:', this.isInitialized);
            if (!this.isInitialized) return null;

            const offerings = await Purchases.getOfferings();
            console.log('💰 Offerings fetched:', offerings);

            if (offerings.current !== null) {
                this.currentOffering = offerings.current;
            } else {
                console.warn('💰 Offerings.current is null! Check RC Dashboard "Current" offering.');
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

    async manageSubscriptions() {
        if (Capacitor.getPlatform() === 'ios') {
            window.location.href = 'https://apps.apple.com/account/subscriptions';
        } else if (Capacitor.getPlatform() === 'android') {
            window.location.href = 'https://play.google.com/store/account/subscriptions';
        } else {
            console.warn('Manage Subscriptions not supported on web/dev');
            alert('On a real device, this opens the App Store Subscription settings.');
        }
    }
}

export default new PurchaseService();
