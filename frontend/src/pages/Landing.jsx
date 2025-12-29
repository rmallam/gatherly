import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, QrCode, Users, ScanLine, ArrowRight, Scan, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const Landing = () => {
    const { user, logout } = useAuth();
    const { events } = useApp();
    const navigate = useNavigate();

    const totalGuests = events.reduce((sum, event) => sum + (event.guests?.length || 0), 0);

    // Logged-in user view
    if (user && !user.isGuest) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 'calc(60px + env(safe-area-inset-bottom))' }}>
                {/* Header */}
                <div style={{ padding: '3rem 1rem 2rem', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scan size={32} color="white" strokeWidth={2} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                        Welcome back, {user?.name || 'User'}!
                    </h1>
                    {console.log('Landing page user:', JSON.stringify(user))}
                    <p style={{ fontSize: '0.9375rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                        Ready to manage your events
                    </p>
                </div>

                {/* Action Cards */}
                <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                    {/* My Events Card */}
                    <div
                        onClick={() => navigate('/manager')}
                        className="card"
                        style={{
                            padding: '1.75rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Calendar size={32} color="white" strokeWidth={2} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                                    My Events
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                                    Create and manage events
                                </p>
                            </div>
                            <ArrowRight size={24} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                        </div>
                    </div>

                    {/* Scanner Card */}
                    <div
                        onClick={() => navigate('/scanner')}
                        className="card"
                        style={{
                            padding: '1.75rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <QrCode size={32} color="white" strokeWidth={2} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                                    Scan Guests
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                                    Check-in attendees
                                </p>
                            </div>
                            <ArrowRight size={24} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{
                    padding: '3rem 1rem 2rem',
                    maxWidth: '500px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '3rem'
                }}>
                    <div
                        onClick={() => navigate('/manager')}
                        style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary)' }}>{events.length}</div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Events</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border)' }}></div>
                    <div
                        onClick={() => navigate('/manager')}
                        style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary)' }}>{totalGuests}</div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Guests</div>
                    </div>
                </div>

                <BottomNavigation />
            </div>
        );
    }

    // Guest/non-logged-in view
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div style={{ padding: '3rem 1rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', margin: '0 auto 1.5rem', borderRadius: '18px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scan size={40} color="white" strokeWidth={2} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                    Host<i>Eze</i>
                </h1>
                <p style={{ fontSize: '0.9375rem', fontWeight: 400, maxWidth: '400px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                    Seamless event management and guest tracking
                </p>
            </div>

            {/* Action Cards */}
            <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                {/* Manager Card */}
                <div
                    onClick={() => navigate('/manager')}
                    className="card"
                    style={{
                        padding: '1.75rem',
                        cursor: 'pointer',
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Calendar size={32} color="white" strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                                Event Manager
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                                Create and manage events
                            </p>
                        </div>
                        <ArrowRight size={24} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    </div>
                </div>

                {/* Scanner Card */}
                <div
                    onClick={() => navigate('/scanner')}
                    className="card"
                    style={{
                        padding: '1.75rem',
                        cursor: 'pointer',
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <QrCode size={32} color="white" strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                                QR Scanner
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                                Check-in guests instantly
                            </p>
                        </div>
                        <ArrowRight size={24} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div style={{
                padding: '3rem 1rem',
                maxWidth: '500px',
                margin: '0 auto',
                textAlign: 'center',
                color: 'white'
            }}>
                <p style={{ fontSize: '0.9375rem', marginBottom: '1rem', opacity: 0.9 }}>
                    Ready to get started?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/signup')}
                        style={{
                            padding: '0.875rem 2rem',
                            background: 'white',
                            color: '#667eea',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '0.875rem 2rem',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Landing;
