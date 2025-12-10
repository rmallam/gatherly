import React, { createContext, useContext, useState, useEffect } from 'react';
import { BiometricService } from '../services/biometric';

const AuthContext = createContext();

const API_URL = 'https://gatherly-backend-3vmv.onrender.com/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    const SERVER_NAME = 'gatherly-app';

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                // Check if it's a guest token
                if (token.startsWith('guest_')) {
                    const guestUser = localStorage.getItem('guestUser');
                    if (guestUser) {
                        setUser(JSON.parse(guestUser));
                    }
                    setLoading(false);
                    return;
                }

                // Regular JWT token
                try {
                    const response = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                    } else {
                        // Token is invalid, clear it
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();

        // Check if biometric is available
        BiometricService.isAvailable().then(setBiometricAvailable);
    }, [token]);

    const signup = async (name, email, password) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const loginWithBiometric = async () => {
        try {
            // Authenticate with biometric
            const authenticated = await BiometricService.authenticate();

            if (!authenticated) {
                throw new Error('Biometric authentication failed');
            }

            // Retrieve stored credentials
            const credentials = await BiometricService.getCredentials(SERVER_NAME);

            if (!credentials || !credentials.username || !credentials.password) {
                throw new Error('No saved credentials found');
            }

            // Login with retrieved credentials
            await login(credentials.username, credentials.password);
        } catch (error) {
            console.error('Biometric login failed:', error);
            throw error;
        }
    };

    const enableBiometric = async (email, password) => {
        try {
            await BiometricService.saveCredentials(SERVER_NAME, email, password);
        } catch (error) {
            console.error('Failed to enable biometric:', error);
            throw error;
        }
    };

    const disableBiometric = async () => {
        try {
            await BiometricService.deleteCredentials(SERVER_NAME);
        } catch (error) {
            console.error('Failed to disable biometric:', error);
            throw error;
        }
    };

    const continueAsGuest = () => {
        // Generate unique guest ID
        const guestNumber = Math.floor(10000 + Math.random() * 90000);
        const guestId = `guest-${guestNumber}`;
        const guestUser = {
            id: guestId,
            name: `Guest ${guestNumber}`,
            email: `${guestId}@guest.local`,
            isGuest: true
        };

        // Create a simple token for guest (not JWT, just identifier)
        const guestToken = `guest_${guestId}`;
        localStorage.setItem('token', guestToken);
        localStorage.setItem('guestUser', JSON.stringify(guestUser));
        setToken(guestToken);
        setUser(guestUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('guestUser');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            biometricAvailable,
            signup,
            login,
            loginWithBiometric,
            enableBiometric,
            disableBiometric,
            continueAsGuest,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
