import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scan, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ showAuth = true }) => {
    const { user } = useAuth();

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
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Left - User Profile */}
            <Link
                to="/profile"
                className="tour-profile-nav"
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                    {user.subscription_tier === 'pro' && (
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: '#f59e0b',
                            background: 'rgba(245, 158, 11, 0.15)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            alignSelf: 'flex-start',
                            letterSpacing: '0.5px'
                        }}>
                            PRO
                        </span>
                    )}
                </div>
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

            {/* Right Side Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* AI Assistant Button */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
                    title="HostEze AI Assistant"
                    aria-label="HostEze AI Assistant"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: 'none',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                    </svg>
                </button>

                {/* Admin Link (if admin) */}
                {user?.is_admin && (
                    <Link
                        to="/admin"
                        title="Admin Dashboard"
                        data-testid="admin-dashboard-button"
                        aria-label="Admin Dashboard"
                        accessibilityLabel="Admin Dashboard"
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
            </div>
        </div>
    );
};

export default Header;
