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
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
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
                    background: 'var(--bg-secondary)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
                {user.profilePictureUrl ? (
                    <img
                        src={user.profilePictureUrl}
                        alt={user.name}
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
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
                )}
                <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
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
                color: 'var(--text-primary)',
                textDecoration: 'none',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
            }}>
                <Scan size={22} style={{ color: 'var(--primary)' }} />
                <span>Host<i>Eze</i></span>
            </Link>

            {/* Right - Admin Link (if admin) + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user?.is_admin && (
                    <Link
                        to="/admin"
                        title="Admin Dashboard"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: 'none',
                            borderRadius: '50%',
                            color: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </Link>
                )}
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
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Header;
