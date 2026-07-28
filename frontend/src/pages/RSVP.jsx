import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';
import { Haptics, NotificationType } from '@capacitor/haptics';
import QRGenerator from '../components/QRGenerator';

// Shown to a guest right after they confirm — no account needed. The payload
// is exactly what the host's scanner reads: { e: eventId, g: guestId }.
const CheckInTicket = ({ eventId, guestId, guestName, eventTitle }) => (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🎟️ Your check-in ticket
        </p>
        <QRGenerator
            payload={{ e: eventId, g: guestId }}
            name={guestName}
            eventTitle={eventTitle}
        />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Show this QR code at the door to check in. Screenshot it so you have it offline!
        </p>
    </div>
);

const RSVP = () => {
    const { eventId, guestId } = useParams();
    const { getEvent, rsvpGuest, fetchPublicEvent, publicRsvpGuest, loading: appLoading } = useApp();
    const [status, setStatus] = useState('loading');
    const [guest, setGuest] = useState(null);
    const [event, setEvent] = useState(null);

    const [loadingEvent, setLoadingEvent] = useState(true);

    useEffect(() => {
        const loadEventDetails = async () => {
            try {
                // If we already have the event in context (e.g. local testing as host), use it
                const contextEvent = getEvent(eventId);
                if (contextEvent) {
                    const g = contextEvent.guests?.find(guest => guest.id === guestId);
                    if (g) {
                        setEvent(contextEvent);
                        setGuest(g);
                        if (g.rsvp !== undefined && g.rsvp !== null) {
                            setStatus('already-rsvpd');
                        } else {
                            setStatus('ready');
                        }
                        setLoadingEvent(false);
                        return;
                    }
                }

                // Otherwise, fetch from public API. The public endpoint returns
                // the event object flat, with the guest under `currentUserGuest`
                // (older callers used {event, guest}) — support both shapes.
                const data = await fetchPublicEvent(eventId, guestId);
                const publicEvent = data?.event || data;
                const publicGuest = data?.guest || data?.currentUserGuest;
                if (publicEvent && publicEvent.id && publicGuest) {
                    setEvent(publicEvent);
                    setGuest(publicGuest);
                    if (publicGuest.rsvp !== undefined && publicGuest.rsvp !== null) {
                        setStatus('already-rsvpd');
                    } else {
                        setStatus('ready');
                    }
                } else {
                    setStatus('error');
                }
            } catch (err) {
                console.error('Failed to load invitation:', err);
                setStatus('error');
            } finally {
                setLoadingEvent(false);
            }
        };

        loadEventDetails();
    }, [eventId, guestId, getEvent, fetchPublicEvent]);

    const handleRSVP = async (response) => {
        try {
            await publicRsvpGuest(eventId, guestId, response);
            setStatus('success');
            // Update local state to reflect change
            setGuest(prev => ({ ...prev, rsvp: response }));
            
            try {
                await Haptics.notification({ type: NotificationType.Success });
            } catch (e) {
                // Ignore on web
            }
        } catch (err) {
            console.error('RSVP error:', err);
            alert('Failed to submit RSVP. Please try again.');
        }
    };

    if (status === 'loading') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '32rem', textAlign: 'center', padding: '3rem 2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        Invitation Not Found
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        This invitation link is invalid or has expired.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '32rem', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ width: '4rem', height: '4rem', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        You're All Set!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                        Thanks for confirming, <strong>{guest?.name}</strong>!
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        We can't wait to see you at <strong>{event?.title}</strong>
                    </p>
                    {guest?.rsvp === true ? (
                        <CheckInTicket eventId={eventId} guestId={guestId} guestName={guest?.name} eventTitle={event?.title} />
                    ) : (
                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Changed your mind? You can update your response anytime from this link.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'already-rsvpd') {
        const rsvpStatus = guest.rsvp === true ? 'attending' : 'not attending';
        const rsvpColor = guest.rsvp === true ? 'var(--success)' : 'var(--error)';

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '32rem', padding: '3rem 2rem' }}>
                    <div style={{ width: '4rem', height: '4rem', backgroundColor: guest.rsvp ? '#d1fae5' : '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <CheckCircle size={32} style={{ color: rsvpColor }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                        RSVP Received
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
                        You've confirmed you're <strong style={{ color: rsvpColor }}>{rsvpStatus}</strong> for <strong>{event?.title}</strong>
                    </p>

                    {guest.rsvp === true && (
                        <CheckInTicket eventId={eventId} guestId={guestId} guestName={guest?.name} eventTitle={event?.title} />
                    )}

                    <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {event?.date && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <Calendar size={18} />
                                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            )}
                            {event?.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <MapPin size={18} />
                                    <span>{event.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Need to change your response?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => handleRSVP(false)}
                                className="btn btn-secondary"
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    backgroundColor: guest.rsvp === false ? 'var(--error)' : '',
                                    color: guest.rsvp === false ? 'white' : ''
                                }}
                            >
                                Can't Make It
                            </button>
                            <button
                                onClick={() => handleRSVP(true)}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    backgroundColor: guest.rsvp === true ? 'var(--success)' : ''
                                }}
                            >
                                Yes, I'll Be There!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Ready to RSVP
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '32rem', padding: '3rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        You're Invited!
                    </h1>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#e0e7ff', borderRadius: '9999px', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                            {guest?.name}
                        </span>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        {event?.title}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {event?.date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                <Calendar size={18} />
                                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        )}
                        {event?.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                <MapPin size={18} />
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Will you be attending?
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => handleRSVP(false)}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '0.875rem' }}
                        >
                            Can't Make It
                        </button>
                        <button
                            onClick={() => handleRSVP(true)}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.875rem' }}
                        >
                            Yes, I'll Be There!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RSVP;
