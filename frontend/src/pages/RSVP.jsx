import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';

const RSVP = () => {
    const { eventId, guestId } = useParams();
    const { getEvent, rsvpGuest, loading: appLoading } = useApp();
    const [status, setStatus] = useState('loading');
    const [guest, setGuest] = useState(null);
    const [event, setEvent] = useState(null);

    useEffect(() => {
        // Wait for app context to load events
        if (appLoading) {
            setStatus('loading');
            return;
        }

        const ev = getEvent(eventId);
        if (!ev) {
            setStatus('error');
            return;
        }

        const g = ev.guests?.find(guest => guest.id === guestId);
        if (!g) {
            setStatus('error');
            return;
        }

        setEvent(ev);
        setGuest(g);

        if (g.rsvp !== undefined && g.rsvp !== null) {
            setStatus('already-rsvpd');
        } else {
            setStatus('ready');
        }
    }, [eventId, guestId, getEvent, appLoading]);

    const handleRSVP = async (response) => {
        try {
            await rsvpGuest(eventId, guestId, response);
            setStatus('success');
        } catch (err) {
            console.error('RSVP error:', err);
            setStatus('error');
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
                    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            You'll receive your QR code ticket soon. Show it at the door to check in!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'already-rsvpd') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '32rem', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ width: '4rem', height: '4rem', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <CheckCircle size={32} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        Already Confirmed
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You've already RSVP'd to <strong>{event?.title}</strong>
                    </p>
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
