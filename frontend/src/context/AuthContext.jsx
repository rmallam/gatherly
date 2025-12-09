import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

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
            signup,
            login,
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
