import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, MapPin, Loader, ArrowLeft } from 'lucide-react';

const PublicInvitation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchPublicEvent } = useApp();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
        try {
            const eventData = await fetchPublicEvent(id);
            setEvent(eventData);
        } catch (err) {
            setError('Event not found');
        } finally {
            setLoading(false);
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

                {/* Event Details Card */}
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Date */}
                        {event.date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Calendar size={24} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>
                        )}

                        {/* Time */}
                        {event.time && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Clock size={24} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{event.time}</div>
                                </div>
                            </div>
                        )}

                        {/* Venue */}
                        {event.venue?.name && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <MapPin size={24} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Venue</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{event.venue.name}</div>
                                    {event.venue.address && (
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {event.venue.address}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {event.description && (
                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>About the Event</div>
                                <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>{event.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Message */}
                <div style={{ textAlign: 'center', color: 'white', fontSize: '0.875rem', opacity: 0.9, marginBottom: '1rem' }}>
                    We look forward to seeing you there! 🎉
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', color: 'white', opacity: 0.7, fontSize: '0.75rem' }}>
                    Powered by Dravify ✨
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
