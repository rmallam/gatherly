import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ScanLine, ArrowRight } from 'lucide-react';

const Landing = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem', padding: '4rem 0' }}>
            <div style={{ textAlign: 'center', maxWidth: '42rem' }}>
                <h1 style={{ fontSize: '3.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Event Management <br />
                    <span style={{ color: 'var(--primary)' }}>Made Simple</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Create events, manage guest lists, and verify attendees with QR codes.
                    Everything you need for seamless event management.
                </p>
            </div>

            <div className="grid grid-lg-2" style={{ width: '100%', maxWidth: '56rem', gap: '2rem' }}>
                {/* Manager Card */}
                <Link to="/manager" className="card" style={{ textDecoration: 'none', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.2s' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', backgroundColor: '#e0e7ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={28} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Event Manager</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                            Create events, add guests, and generate secure QR code invitations.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9375rem', marginTop: 'auto' }}>
                        Get Started <ArrowRight size={16} />
                    </div>
                </Link>

                {/* Scanner Card */}
                <Link to="/scanner" className="card" style={{ textDecoration: 'none', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.2s' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', backgroundColor: '#d1fae5', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ScanLine size={28} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Scanner</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                            Scan QR codes at the door to verify guests and track attendance.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.9375rem', marginTop: 'auto' }}>
                        Open Scanner <ArrowRight size={16} />
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Landing;
