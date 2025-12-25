import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scan, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ showAuth = true }) => {
    const { user, logout } = useAuth();

    if (!showAuth || !user) {
        return null;
    }

    return (
        <div style={{
            padding: '12px 16px',
            paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Left - User Profile */}
            <Link
                to="/profile"
                style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: '#f3f4f6',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
            >
                <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700'
                }}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {user.name}
                </span>
            </Link>

            {/* Center - HostEze Branding */}
            <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                textDecoration: 'none',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
            }}>
                <Scan size={22} style={{ color: '#6366f1' }} />
                <span>HostEze</span>
            </Link>

            {/* Right - Logout */}
            <button
                onClick={logout}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
            >
                <LogOut size={16} />
            </button>
        </div>
    );
};

export default Header;
