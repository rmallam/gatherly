import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, ArrowLeft, MessageCircle, CheckCircle, XCircle, QrCode } from 'lucide-react';
import QRGenerator from '../components/QRGenerator';

const GuestEventView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getEvent, rsvpGuest } = useApp();
    const { user } = useAuth();
    const event = getEvent(id);
    const [currentGuest, setCurrentGuest] = useState(null);
    const [isRSVPing, setIsRSVPing] = useState(false);

    // Find the current guest in the event's guest list
    useEffect(() => {
        if (!event || !event.guests) return;

        const guest = event.guests.find(g => {
            const emailMatch = user?.email && g.email === user.email;
            const phoneMatch = user?.phone && g.phone === user.phone;
            const idMatch = g.id === user?.id;

            return emailMatch || phoneMatch || idMatch;
        });

        setCurrentGuest(guest);
    }, [event, user]);

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

    // Get RSVP status from currentGuest if matched, otherwise from event
    const rsvpStatus = currentGuest ? currentGuest.rsvp : event.rsvp;
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

                {/* RSVP Buttons - Only show if current user ismatched to a guest */}
                {currentGuest && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            {hasRSVPd ? 'Want to change your response?' : 'Will you be attending?'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={async () => {
                                    setIsRSVPing(true);
                                    try {
                                        await rsvpGuest(event.id, currentGuest.id, false);
                                    } catch (err) {
                                        console.error('RSVP error:', err);
                                        alert('Failed to update RSVP. Please try again.');
                                    } finally {
                                        setIsRSVPing(false);
                                    }
                                }}
                                disabled={isRSVPing}
                                className="btn"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: rsvpStatus === false ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--bg-secondary)',
                                    color: rsvpStatus === false ? 'white' : 'var(--text-primary)',
                                    border: rsvpStatus === false ? 'none' : '1px solid var(--border)',
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}
                            >
                                {rsvpStatus === false ? '✓ Not Attending' : "Can't Make It"}
                            </button>
                            <button
                                onClick={async () => {
                                    setIsRSVPing(true);
                                    try {
                                        await rsvpGuest(event.id, currentGuest.id, true);
                                    } catch (err) {
                                        console.error('RSVP error:', err);
                                        alert('Failed to update RSVP. Please try again.');
                                    } finally {
                                        setIsRSVPing(false);
                                    }
                                }}
                                disabled={isRSVPing}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: rsvpStatus === true ? 'linear-gradient(135deg, #10b981, #059669)' : '',
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}
                            >
                                {rsvpStatus === true ? '✓ Attending' : "I'll Be There!"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Guest QR Code for Check-in - Only show if guest is found in list */}
            {currentGuest && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <QrCode size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                Your Check-in QR Code
                            </h3>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                            Show this QR code at the event entrance for quick check-in
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <QRGenerator
                            payload={{
                                eventId: event.id,
                                guestId: currentGuest.id,
                                name: currentGuest.name,
                                valid: true,
                                timestamp: Date.now()
                            }}
                            name={currentGuest.name}
                            eventTitle={event.title}
                            phoneNumber={currentGuest.phone}
                        />
                    </div>
                </div>
            )}

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
