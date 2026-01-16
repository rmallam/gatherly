import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, MapPin, Loader, ArrowLeft, QrCode, CheckCircle, XCircle } from 'lucide-react';
import QRGenerator from '../components/QRGenerator';

const PublicInvitation = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const guestId = searchParams.get('guest');

    const navigate = useNavigate();
    const { fetchPublicEvent, submitPublicRSVP } = useApp();

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

            // If the backend returned the guest object (via our modified endpoint)
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
        if (!guest) return;

        setIsRSVPing(true);
        try {
            await submitPublicRSVP(id, {
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                response: response ? 'yes' : 'no'
            });

            // Optimistically update local state
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}>
                <Loader size={48} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (error && !event) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem' }}>Oops!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    <ArrowLeft size={16} /> Go Home
                </button>
            </div>
        );
    }

    const rsvpStatus = guest?.rsvp;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Hero Section */}
                <div style={{ textAlign: 'center', color: 'white', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        You're Invited!
                    </h1>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, opacity: 0.95 }}>
                        {event.title}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gap: '2rem' }}>

                    {/* 1. Event Details Card */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {event.date && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calendar size={24} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</div>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    </div>
                                </div>
                            )}

                            {event.time && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Clock size={24} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</div>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{event.time}</div>
                                    </div>
                                </div>
                            )}

                            {event.venue?.name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={24} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Venue</div>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{event.venue.name}</div>
                                        {event.venue.address && (
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{event.venue.address}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. RSVP Section (Only if guest is identified) */}
                    {guest && (
                        <div className="card" style={{ padding: '2rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    {rsvpSuccess ? 'Response Saved!' : 'Will you be attending?'}
                                </h3>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {guest.name}, {rsvpStatus === true ? "we're excited to see you! 🎉" : rsvpStatus === false ? "we're sorry you can't make it." : "please let us know."}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    onClick={() => handleRSVP(false)}
                                    disabled={isRSVPing}
                                    className={`btn ${rsvpStatus === false ? 'btn-danger' : 'btn-ghost'}`}
                                    style={{ justifyContent: 'center', borderColor: rsvpStatus === false ? 'transparent' : 'var(--border)' }}
                                >
                                    {rsvpStatus === false && <XCircle size={18} style={{ marginRight: '8px' }} />}
                                    Can't Make It
                                </button>
                                <button
                                    onClick={() => handleRSVP(true)}
                                    disabled={isRSVPing}
                                    className={`btn ${rsvpStatus === true ? 'btn-success' : 'btn-primary'}`}
                                    style={{ justifyContent: 'center' }}
                                >
                                    {rsvpStatus === true && <CheckCircle size={18} style={{ marginRight: '8px' }} />}
                                    I'll Be There
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 3. QR Code Section (Only if guest is identified) */}
                    {guest && (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                <QrCode size={20} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Your Entry Pass</h3>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
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

                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Please save or screenshot this QR code and show it at the entrance.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', color: 'white', opacity: 0.7, fontSize: '0.75rem', marginTop: '3rem' }}>
                    Powered by Host<i>Eze</i> ✨
                </div>

                {/* DEBUG: REMOVE LATER */}
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#333', color: '#0f0', fontSize: '10px', overflow: 'auto' }}>
                    <p>DEBUG INFO:</p>
                    <p>Guest Loaded: {guest ? 'YES' : 'NO'}</p>
                    <pre>{JSON.stringify(guest, null, 2)}</pre>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .btn-success {
                    background-color: #10b981;
                    color: white;
                    border: none;
                }
                .btn-danger {
                    background-color: #ef4444;
                    color: white;
                    border: none;
                }
                .btn-ghost {
                    background-color: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
};

export default PublicInvitation;
