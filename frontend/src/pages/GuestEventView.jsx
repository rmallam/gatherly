import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, ArrowLeft, MessageCircle, CheckCircle, XCircle, QrCode, AlignLeft } from 'lucide-react';
import QRGenerator from '../components/QRGenerator';
import './GuestEventView.css';

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

        const normalizePhone = (phone) => {
            if (!phone) return null;
            // Remove all non-digits and get last 10 digits
            const digits = phone.replace(/\D/g, '');
            return digits.slice(-10);
        };

        const guest = event.guests.find(g => {
            const emailMatch = user?.email && g.email === user.email;

            // Flexible phone matching - compare last 10 digits
            const userPhoneNormalized = normalizePhone(user?.phone);
            const guestPhoneNormalized = normalizePhone(g.phone);
            const phoneMatch = userPhoneNormalized && guestPhoneNormalized &&
                userPhoneNormalized === guestPhoneNormalized;

            const idMatch = g.user_id === user?.id;

            return emailMatch || phoneMatch || idMatch;
        });

        setCurrentGuest(guest);
    }, [event, user]);

    if (!event) {
        return (
            <div className="guest-view-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Event not found</h2>
                    <Link to="/" style={{ color: '#818cf8', textDecoration: 'none', marginTop: '1rem', display: 'block' }}>
                        Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    // Get RSVP status from currentGuest if matched, otherwise from event
    const rsvpStatus = currentGuest ? currentGuest.rsvp : event.rsvp;
    const hasRSVPd = rsvpStatus !== null && rsvpStatus !== undefined;

    return (
        <div className="guest-view-container">
            {/* Header */}
            <div className="guest-header">
                <button
                    onClick={() => navigate('/')}
                    className="back-btn"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="invite-badge-container">
                    <div className="invite-badge">You're Invited</div>
                    <h1 className="event-title-hero">{event.title}</h1>
                </div>
            </div>

            {/* Event Wall Button - Moved to Top */}
            <Link to={`/event/${id}/wall`} className="event-wall-btn">
                <MessageCircle size={20} fill="white" />
                Open Event Wall
            </Link>

            {/* Event Details Card */}
            <div className="glass-card">
                <div className="card-label">
                    Event Details
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {event.date && (
                        <div className="detail-row">
                            <div className="icon-box date">
                                <Calendar size={24} color="white" />
                            </div>
                            <div className="detail-content">
                                <div className="detail-label">DATE & TIME</div>
                                <div className="detail-value">
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
                        <div className="detail-row">
                            <div className="icon-box location">
                                <MapPin size={24} color="white" />
                            </div>
                            <div className="detail-content">
                                <div className="detail-label">LOCATION</div>
                                <div className="detail-value">{event.location}</div>
                            </div>
                        </div>
                    )}

                    {event.description && (
                        <div className="detail-row">
                            <div className="icon-box desc" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                                <AlignLeft size={24} />
                            </div>
                            <div className="detail-content">
                                <div className="detail-label">DESCRIPTION</div>
                                <p className="detail-desc">{event.description}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RSVP Status Card */}
            <div className="glass-card">
                <div className="rsvp-header">
                    <div className="card-label" style={{ marginBottom: 0 }}>Your RSVP</div>
                    {hasRSVPd && (
                        <div className={`status-bubble ${rsvpStatus ? 'status-attending' : 'status-not-attending'}`}>
                            {rsvpStatus ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {rsvpStatus ? 'Attending' : 'Not Attending'}
                        </div>
                    )}
                </div>

                {/* RSVP Buttons */}
                {currentGuest ? (
                    <div className="rsvp-actions">
                        <p className="rsvp-prompt">
                            {hasRSVPd ? 'Want to change your response?' : 'Will you be attending this event?'}
                        </p>
                        <div className="rsvp-buttons-grid">
                            <button
                                onClick={async () => {
                                    setIsRSVPing(true);
                                    try { await rsvpGuest(event.id, currentGuest.id, false); }
                                    catch (err) { alert('Failed to update RSVP'); }
                                    finally { setIsRSVPing(false); }
                                }}
                                disabled={isRSVPing}
                                className={`rsvp-btn btn-reject ${!rsvpStatus && hasRSVPd ? 'active' : ''}`}
                            >
                                Can't Make It
                            </button>
                            <button
                                onClick={async () => {
                                    setIsRSVPing(true);
                                    try { await rsvpGuest(event.id, currentGuest.id, true); }
                                    catch (err) { alert('Failed to update RSVP'); }
                                    finally { setIsRSVPing(false); }
                                }}
                                disabled={isRSVPing}
                                className={`rsvp-btn btn-accept ${rsvpStatus ? 'active' : ''}`}
                            >
                                I'll Be There
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: '16px', color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
                        Please log in as the invited guest to RSVP.
                    </div>
                )}
            </div>

            {/* QR Code Card - Only show if guest is found */}
            {currentGuest && (
                <div className="glass-card">
                    <div className="card-label">
                        <QrCode size={16} />
                        Your Check-in Code
                    </div>

                    <div className="qr-container">
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
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '16px' }}>
                        Show this at the entrance
                    </p>
                </div>
            )}


        </div>
    );
};

export default GuestEventView;
