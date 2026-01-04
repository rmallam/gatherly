import React, { useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle, Mail, X, DollarSign, Clock } from 'lucide-react';

const OverviewTab = ({ event }) => {
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalGuests, setModalGuests] = useState([]);

    if (!event) return null;

    const isSharedEvent = event.event_type === 'shared';

    // Shared Event Overview (Trip-focused)
    if (isSharedEvent) {
        const totalParticipants = (event.guests?.length || 0) + 1; // +1 for organizer
        const eventDate = event.date ? new Date(event.date) : null;
        const today = new Date();
        const daysUntil = eventDate ? Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24)) : null;

        // Calculate trip duration
        let tripDuration = 1;
        if (event.end_date && event.date) {
            const start = new Date(event.date);
            const end = new Date(event.end_date);
            tripDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }

        return (
            <div>
                {/* Event Header */}
                <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '2rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1rem', color: 'white', lineHeight: '1.2', letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>{event.title}</h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9375rem', opacity: 0.95 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            {event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
                            {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                        {event.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} />
                                {event.location}
                            </span>
                        )}
                    </div>
                    {event.description && (
                        <p style={{ marginTop: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                            {event.description}
                        </p>
                    )}
                </div>

                {/* Trip Stats Grid */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {/* Total Participants */}
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={28} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalParticipants}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Participants</div>
                            </div>
                        </div>
                    </div>

                    {/* Days Until Trip */}
                    {daysUntil !== null && (
                        <div className="card" style={{ padding: '1.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={28} style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {daysUntil > 0 ? daysUntil : daysUntil === 0 ? 'Today!' : 'Past'}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        {daysUntil > 0 ? 'Days Away' : daysUntil === 0 ? 'Happening Now' : 'Days Ago'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trip Duration */}
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={28} style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tripDuration}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Day{tripDuration !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Host Event Overview (Guest-focused) - Original code
    const totalGuests = event.guests?.length || 0;
    const confirmedGuests = event.guests?.filter(g => g.rsvp === true) || [];
    const checkedInGuests = event.guests?.filter(g => g.attended) || [];
    const pendingRSVP = event.guests?.filter(g => g.rsvp === null || g.rsvp === undefined).length || 0;
    const declinedRSVP = event.guests?.filter(g => g.rsvp === false).length || 0;

    const attendanceRate = totalGuests > 0 ? Math.round((checkedInGuests.length / totalGuests) * 100) : 0;
    const responseRate = totalGuests > 0 ? Math.round(((confirmedGuests.length + declinedRSVP) / totalGuests) * 100) : 0;

    const showGuestList = (title, guests) => {
        setModalTitle(title);
        setModalGuests(guests);
        setShowGuestModal(true);
    };

    return (
        <div>
            {/* Event Header */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '2rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1rem', color: 'white', lineHeight: '1.2', letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>{event.title}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9375rem', opacity: 0.95 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} />
                        {event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
                    </span>
                    {event.venue?.name ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} />
                            {event.venue.name}{event.venue.address && `, ${event.venue.address}`}
                        </span>
                    ) : event.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} />
                            {event.location}
                        </span>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid - Only 3 essential cards */}
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {/* Total Guests */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={28} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalGuests}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Invited</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        <button
                            onClick={() => showGuestList('Confirmed Guests', confirmedGuests)}
                            style={{ background: 'none', border: 'none', padding: 0, color: '#10b981', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            ✓ {confirmedGuests.length} confirmed
                        </button>
                        <button
                            onClick={() => showGuestList('Declined Guests', event.guests?.filter(g => g.rsvp === false) || [])}
                            style={{ background: 'none', border: 'none', padding: 0, color: '#ef4444', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            ✗ {declinedRSVP} declined
                        </button>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>⏳ {pendingRSVP} pending</span>
                    </div>
                </div>

                {/* Check-ins */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={28} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <button
                                onClick={() => showGuestList('Checked-In Guests', checkedInGuests)}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'underline' }}>{checkedInGuests.length}</div>
                            </button>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Checked In</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{attendanceRate}%</span> attendance rate
                    </div>
                </div>

                {/* RSVPs */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={28} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{confirmedGuests.length + declinedRSVP}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>RSVPs</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{responseRate}%</span> response rate
                    </div>
                </div>
            </div>

            {/* Guest List Modal */}
            {showGuestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card" style={{
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0
                    }}>
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{modalTitle} ({modalGuests.length})</h2>
                            <button onClick={() => setShowGuestModal(false)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Guest List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {modalGuests.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No guests found
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {modalGuests.map(guest => (
                                        <div key={guest.id} className="card" style={{ padding: '1rem', background: 'var(--bg-secondary)' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                {guest.name}
                                            </div>
                                            {guest.phone && (
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    <a href={`tel:${guest.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                        📞 {guest.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {guest.attended && (
                                                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 500 }}>
                                                    ✓ Checked in {guest.attendedCount}x
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
