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
            const result = await NativeBiometric.verifyIdentity({
                reason: 'Authenticate to access Guest Scanner',
                title: 'Biometric Authentication',
                subtitle: 'Please verify your identity',
                description: 'Use your fingerprint or face to login',
                maxAttempts: 3
            });

            // Check result explicitly - some versions return object, some return undefined on success
            console.log('Biometric verification result:', result);

            // If result exists and has verified property, check it
            // Otherwise, if no error was thrown, consider it successful
            if (result && result.verified === false) {
                return false;
            }

            return true;
        } catch (error) {
            // More specific error logging
            console.error('Biometric authentication failed:', {
                code: error.code,
                message: error.message,
                error: error
            });

            // Handle specific error codes
            if (error.code === 10) {
                // User cancelled
                console.log('User cancelled biometric auth');
            } else if (error.code === 13) {
                // Too many attempts
                console.log('Too many biometric auth attempts');
            }

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

    // Check if credentials exist
    async hasCredentials(server) {
        try {
            const credentials = await NativeBiometric.getCredentials({
                server,
            });
            return credentials && credentials.username && credentials.password;
        } catch (error) {
            // If error, credentials don't exist
            return false;
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
