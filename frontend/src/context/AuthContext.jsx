import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import pushNotificationService from '../services/PushNotificationService';
import PurchaseService from '../services/PurchaseService';
import API_URL from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Tour States
    const [hasSeenDashboardTour, setHasSeenDashboardTour] = useState(
        localStorage.getItem('hasSeenDashboardTour') === 'true'
    );
    const [hasSeenEventTour, setHasSeenEventTour] = useState(
        localStorage.getItem('hasSeenEventTour') === 'true'
    );
    const [seenTabTours, setSeenTabTours] = useState(() => {
        const stored = localStorage.getItem('seenTabTours');
        return stored ? JSON.parse(stored) : {};
    });

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                // Check if it's a guest token
                if (storedToken.startsWith('guest_')) {
                    const guestUser = localStorage.getItem('guestUser');
                    if (guestUser) {
                        setUser(JSON.parse(guestUser));
                    }
                    setLoading(false);
                    return;
                }

                // Regular JWT token
                try {
                    const response = await fetchWithRetry(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    }, 3, 15000);

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                        setToken(storedToken);

                        // Initialize RevenueCat
                        try {
                            PurchaseService.initialize(data.user.id);
                        } catch (e) {
                            console.error('Failed to init purchases:', e);
                        }
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
    }, [token]);

    // identifier can be an email address or a phone number.
    const sendOTP = async (identifier) => {
        const response = await fetchWithRetry(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        }, 3, 30000);

        if (!response.ok) {
            let errorMessage = 'Failed to send code';
            try {
                const error = await response.json();
                errorMessage = error.error || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        return await response.json();
    };

    const verifyOTP = async (identifier, code, name) => {
        const response = await fetchWithRetry(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, code, name })
        }, 3, 30000);

        if (!response.ok) {
            let errorMessage = 'Invalid OTP';
            try {
                const error = await response.json();
                errorMessage = error.error || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Save session
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);

        // Initialize RevenueCat
        try {
            PurchaseService.initialize(data.user.id);
        } catch (e) {
            console.error('Failed to init purchases:', e);
        }

        // Register device
        try {
            await pushNotificationService.registerDevice(data.user.id, data.token);
        } catch (error) {
            console.error('Failed to register device:', error);
        }

        return data;
    };

    const logout = () => {
        // Unregister device for push notifications
        pushNotificationService.unregisterDevice().catch(error => {
            console.error('Failed to unregister device:', error);
        });

        localStorage.removeItem('token');
        localStorage.removeItem('guestUser');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken || storedToken.startsWith('guest_')) {
            return;
        }

        try {
            const response = await fetchWithRetry(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            }, 3, 15000);

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const completeDashboardTour = () => {
        localStorage.setItem('hasSeenDashboardTour', 'true');
        setHasSeenDashboardTour(true);
    };

    const completeEventTour = () => {
        localStorage.setItem('hasSeenEventTour', 'true');
        setHasSeenEventTour(true);
    };

    const completeTabTour = (tabId) => {
        setSeenTabTours(prev => {
            const nextState = { ...prev, [tabId]: true };
            localStorage.setItem('seenTabTours', JSON.stringify(nextState));
            return nextState;
        });
    };

    const resetTours = () => {
        localStorage.removeItem('hasSeenDashboardTour');
        localStorage.removeItem('hasSeenEventTour');
        localStorage.removeItem('seenTabTours');
        setHasSeenDashboardTour(false);
        setHasSeenEventTour(false);
        setSeenTabTours({});
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            sendOTP,
            verifyOTP,
            logout,
            refreshUser,
            isAuthenticated: !!user,
            // Tour context expose
            hasSeenDashboardTour,
            hasSeenEventTour,
            seenTabTours,
            completeDashboardTour,
            completeEventTour,
            completeTabTour,
            resetTours
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
