import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, MapPin, Loader, ArrowLeft, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import QRGenerator from '../components/QRGenerator';

const PublicInvitation = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const guestId = searchParams.get('guest');

    const navigate = useNavigate();
    const { fetchPublicEvent, publicRsvpGuest } = useApp();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [guest, setGuest] = useState(null);
    const [isRSVPing, setIsRSVPing] = useState(false);
    const [rsvpSuccess, setRsvpSuccess] = useState(false);

    useEffect(() => {
        loadEvent();
    }, [id, guestId]);

    const loadEvent = async () => {
        try {
            const eventData = await fetchPublicEvent(id, guestId);
            setEvent(eventData);

            if (eventData.currentUserGuest) {
                console.log('Guest found:', eventData.currentUserGuest);
                setGuest(eventData.currentUserGuest);
            } else {
                console.log('No guest found in event data. Query param:', guestId);
            }
        } catch (err) {
            setError('Event not found');
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (response) => {
        if (!guest || !publicRsvpGuest) return;

        setIsRSVPing(true);
        try {
            await publicRsvpGuest(id, guest.id, response);

            setGuest(prev => ({
                ...prev,
                rsvp: response,
                rsvpTime: new Date().toISOString()
            }));
            setRsvpSuccess(true);
            setTimeout(() => setRsvpSuccess(false), 3000);
        } catch (err) {
            alert('Failed to update RSVP. Please try again.');
        } finally {
            setIsRSVPing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Loader size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (error && !event) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center', background: 'var(--bg-primary)' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Oops!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    <ArrowLeft size={16} /> Go Home
                </button>
            </div>
        );
    }

    const rsvpStatus = guest?.rsvp;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem 3rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            You're Invited!
                        </h1>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)', margin: 0 }}>
                        {event.title}
                    </h2>
                    {guest && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Hi {guest.name}! 👋
                        </p>
                    )}
                </div>

                {/* Main Content */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Event Details Card */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} style={{ color: 'var(--primary)' }} />
                            Event Details
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {event.date && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Calendar size={20} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.125rem' }}>Date</div>
                                        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {event.time && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Clock size={20} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.125rem' }}>Time</div>
                                        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>{event.time}</div>
                                    </div>
                                </div>
                            )}

                            {event.venue?.name && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MapPin size={20} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.125rem' }}>Venue</div>
                                        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>{event.venue.name}</div>
                                        {event.venue.address && (
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{event.venue.address}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {event.description && (
                                <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', fontWeight: 600 }}>About</div>
                                    <div style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{event.description}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RSVP Section */}
                    {guest && (
                        <div className="card" style={{ padding: '1.5rem', background: rsvpSuccess ? 'var(--success-bg)' : 'var(--bg-card)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                    {rsvpSuccess ? '✨ Response Saved!' : 'Will you be attending?'}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {rsvpStatus === true ? "We're excited to see you! 🎉" : rsvpStatus === false ? "We're sorry you can't make it." : "Please let us know your response."}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <button
                                    onClick={() => handleRSVP(false)}
                                    disabled={isRSVPing}
                                    className="btn"
                                    style={{
                                        justifyContent: 'center',
                                        background: rsvpStatus === false ? '#ef4444' : 'transparent',
                                        color: rsvpStatus === false ? 'white' : 'var(--text-primary)',
                                        border: rsvpStatus === false ? 'none' : '1.5px solid var(--border)',
                                        fontWeight: 500
                                    }}
                                >
                                    {rsvpStatus === false && <XCircle size={16} style={{ marginRight: '6px' }} />}
                                    Can't Make It
                                </button>
                                <button
                                    onClick={() => handleRSVP(true)}
                                    disabled={isRSVPing}
                                    className="btn btn-primary"
                                    style={{ justifyContent: 'center', fontWeight: 500 }}
                                >
                                    {rsvpStatus === true && <CheckCircle size={16} style={{ marginRight: '6px' }} />}
                                    I'll Be There
                                </button>
                            </div>
                        </div>
                    )}

                    {/* QR Code Section */}
                    {guest && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <QRGenerator
                                payload={{
                                    eventId: event.id,
                                    guestId: guest.id,
                                    name: guest.name,
                                    valid: true,
                                    timestamp: Date.now()
                                }}
                                name={guest.name}
                                eventTitle={event.title}
                                phoneNumber={guest.phone}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '3rem' }}>
                    Powered by Host<i>Eze</i> ✨
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PublicInvitation;
