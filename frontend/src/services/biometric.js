import { NativeBiometric } from '@capgo/capacitor-native-biometric';

export const BiometricService = {
    // Check if biometric is available
    async isAvailable() {
        try {
            const result = await NativeBiometric.isAvailable();
            return result.isAvailable;
        } catch (error) {
            console.error('Biometric not available:', error);
            return false;
        }
    },

    // Authenticate user with biometric
    async authenticate() {
        try {
            await NativeBiometric.verifyIdentity({
                reason: 'Authenticate to access Guest Scanner',
                title: 'Biometric Authentication',
                subtitle: 'Please verify your identity',
                description: 'Use your fingerprint or face to login',
            });
            return true;
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            return false;
        }
    },

    // Save credentials securely
    async saveCredentials(server, username, password) {
        try {
            await NativeBiometric.setCredentials({
                username,
                password,
                server,
            });
        } catch (error) {
            console.error('Failed to save credentials:', error);
        }
    },

    // Get saved credentials
    async getCredentials(server) {
        try {
            const credentials = await NativeBiometric.getCredentials({
                server,
            });
            return credentials;
        } catch (error) {
            console.error('Failed to get credentials:', error);
            return null;
        }
    },

    // Delete credentials
    async deleteCredentials(server) {
        try {
            await NativeBiometric.deleteCredentials({
                server,
            });
        } catch (error) {
            console.error('Failed to delete credentials:', error);
        }
    }
};
