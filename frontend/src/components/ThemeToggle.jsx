import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid var(--border)',
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-primary)',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'var(--shadow-sm)',
                backdropFilter: isDark ? 'blur(10px)' : 'none'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = isDark
                    ? '0 6px 16px rgba(0, 0, 0, 0.4)'
                    : 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : 'var(--shadow-sm)';
            }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

export default ThemeToggle;
