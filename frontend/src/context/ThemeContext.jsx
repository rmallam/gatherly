import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Enforce dark mode class
        document.documentElement.className = 'theme-dark';
        localStorage.setItem('theme', 'dark');
    }, []);

    // Toggle is disabled/noop
    const toggleTheme = () => {
        console.log("Theme toggle is disabled. Enforcing Dark Mode.");
    };

    const value = {
        theme: 'dark',
        toggleTheme,
        isDark: true,
        isLight: false
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
