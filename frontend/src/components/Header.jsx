import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ showAuth = true }) => {
    const { user, logout } = useAuth();

    return (
        <div style={{
            padding: '1rem 1.5rem',
            paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)'
        }}>
            {/* Branding */}
            <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none'
            }}>
                <Scan size={24} style={{ color: 'var(--primary)' }} />
                <span>Gatherly</span>
            </Link>

            {/* Right Side - Auth Buttons or User Menu */}
            {showAuth && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {user ? (
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <User size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {user.name}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="btn btn-secondary"
                                style={{
                                    padding: '0.5rem 0.875rem',
                                    fontSize: '0.8125rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem'
                                }}
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button
                                    className="btn btn-secondary"
                                    style={{
                                        padding: '0.5rem 0.875rem',
                                        fontSize: '0.8125rem'
                                    }}
                                >
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.5rem 0.875rem',
                                        fontSize: '0.8125rem'
                                    }}
                                >
                                    Sign Up
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;
