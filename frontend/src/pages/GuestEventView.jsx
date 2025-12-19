import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, ArrowLeft, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

const GuestEventView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getEvent } = useApp();
    const event = getEvent(id);

    if (!event) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Event not found</h2>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Back to Events
                </Link>
            </div>
        );
    }

    const rsvpStatus = event.rsvp;
    const hasRSVPd = rsvpStatus !== null && rsvpStatus !== undefined;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: 'rgba(99,102,241,0.1)',
                        color: 'var(--primary)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '8px'
                    }}>
                        YOU'RE INVITED
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                        {event.title}
                    </h1>
                </div>
            </div>

            {/* Event Details Card */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                    Event Details
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {event.date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Calendar size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
                                    DATE & TIME
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {event.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <MapPin size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
                                    LOCATION
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    )}

                    {event.description && (
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                                DESCRIPTION
                            </div>
                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                                {event.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* RSVP Status Card */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Your RSVP
                        </h3>
                        {hasRSVPd ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {rsvpStatus ? (
                                    <>
                                        <CheckCircle size={18} color="#10b981" />
                                        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '14px' }}>
                                            Attending
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={18} color="#ef4444" />
                                        <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '14px' }}>
                                            Not Attending
                                        </span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Please respond to your invitation
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Event Wall Button */}
            <Link
                to={`/event/${id}/wall`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(99,102,241,0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.3)';
                }}
            >
                <MessageCircle size={22} strokeWidth={2.5} />
                Open Event Wall
            </Link>
        </div>
    );
};

export default GuestEventView;
