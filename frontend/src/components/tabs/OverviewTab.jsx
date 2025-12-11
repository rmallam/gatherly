import React from 'react';
import { Calendar, MapPin, Users, CheckCircle, Mail } from 'lucide-react';

const OverviewTab = ({ event }) => {
    if (!event) return null;

    const totalGuests = event.guests?.length || 0;
    const confirmedGuests = event.guests?.filter(g => g.rsvp === true).length || 0;
    const checkedInGuests = event.guests?.filter(g => g.attended).length || 0;
    const pendingRSVP = event.guests?.filter(g => g.rsvp === null || g.rsvp === undefined).length || 0;
    const declinedRSVP = event.guests?.filter(g => g.rsvp === false).length || 0;

    const attendanceRate = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;
    const responseRate = totalGuests > 0 ? Math.round(((confirmedGuests + declinedRSVP) / totalGuests) * 100) : 0;

    return (
        <div>
            {/* Event Header */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>{event.title}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9375rem', opacity: 0.95 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} />
                        {event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
                    </span>
                    {event.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} />
                            {event.location}
                        </span>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid - Only 3 essential cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ color: '#10b981', fontWeight: 500 }}>✓ {confirmedGuests} confirmed</span>
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
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{checkedInGuests}</div>
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
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{confirmedGuests + declinedRSVP}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>RSVPs</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{responseRate}%</span> response rate
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
