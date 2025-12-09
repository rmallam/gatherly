import React from 'react';
import { TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const Analytics = ({ event }) => {
    if (!event || !event.guests || event.guests.length === 0) {
        return null;
    }

    const totalGuests = event.guests.length;
    const confirmed = event.guests.filter(g => g.rsvp === true).length;
    const declined = event.guests.filter(g => g.rsvp === false).length;
    const pending = event.guests.filter(g => g.rsvp === null || g.rsvp === undefined).length;
    const checkedIn = event.guests.filter(g => g.attended).length;

    const responseRate = totalGuests > 0 ? Math.round(((confirmed + declined) / totalGuests) * 100) : 0;
    const checkInRate = totalGuests > 0 ? Math.round((checkedIn / totalGuests) * 100) : 0;
    const confirmedRate = totalGuests > 0 ? Math.round((confirmed / totalGuests) * 100) : 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* RSVP Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} style={{ color: 'var(--primary)' }} />
                    RSVP Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Confirmed */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                                Confirmed
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success)' }}>
                                {confirmed} ({confirmedRate}%)
                            </span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${confirmedRate}%`, background: 'var(--success)', transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>

                    {/* Declined */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <XCircle size={16} style={{ color: 'var(--error)' }} />
                                Declined
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--error)' }}>
                                {declined} ({Math.round((declined / totalGuests) * 100)}%)
                            </span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(declined / totalGuests) * 100}%`, background: 'var(--error)', transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>

                    {/* Pending */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} style={{ color: 'var(--warning)' }} />
                                No Response
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--warning)' }}>
                                {pending} ({Math.round((pending / totalGuests) * 100)}%)
                            </span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(pending / totalGuests) * 100}%`, background: 'var(--warning)', transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Response & Check-in Rates */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                    Engagement
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Response Rate */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Response Rate</span>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{responseRate}%</span>
                        </div>
                        <div style={{ height: '12px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${responseRate}%`,
                                background: `linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%)`,
                                transition: 'width 0.5s ease',
                                borderRadius: '999px'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                            {confirmed + declined} of {totalGuests} guests responded
                        </p>
                    </div>

                    {/* Check-in Rate */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Check-in Rate</span>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{checkInRate}%</span>
                        </div>
                        <div style={{ height: '12px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${checkInRate}%`,
                                background: `linear-gradient(90deg, var(--success) 0%, #059669 100%)`,
                                transition: 'width 0.5s ease',
                                borderRadius: '999px'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                            {checkedIn} of {totalGuests} guests checked in
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
