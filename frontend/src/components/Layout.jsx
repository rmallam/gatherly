import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Scan, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col">
            <nav style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div className="container" style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {!isHome && (
                            <Link to="/" style={{ padding: '0.5rem', color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}>
                                <ArrowLeft size={20} />
                            </Link>
                        )}
                        <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <Scan size={24} style={{ color: 'var(--primary)' }} />
                            <span>Gatherly</span>
                        </Link>
                    </div>

                    {/* User Menu */}
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <User size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Guest User Banner */}
            {user?.isGuest && (
                <div style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    color: '#78350f',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <User size={16} />
                    You're using a guest account ({user.name}).
                    <Link to="/signup" style={{ color: '#78350f', textDecoration: 'underline', fontWeight: 600, marginLeft: '0.5rem' }}>
                        Create an account
                    </Link>
                    to save your events permanently!
                </div>
            )}

            <main className="flex-1 container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
                {children}
            </main>

            <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                <p>&copy; {new Date().getFullYear()} Gatherly. Secure Event Management.</p>
            </footer>
        </div>
    );
};

export default Layout;
