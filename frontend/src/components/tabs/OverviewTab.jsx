import React from 'react';
import { Calendar, MapPin, TrendingUp, Users, CheckCircle, Clock, DollarSign } from 'lucide-react';

const OverviewTab = ({ event }) => {
    if (!event) return null;

    const totalGuests = event.guests?.length || 0;
    const confirmedGuests = event.guests?.filter(g => g.rsvp === true).length || 0;
    const checkedInGuests = event.guests?.filter(g => g.attended).length || 0;
    const pendingRSVP = event.guests?.filter(g => g.rsvp === null || g.rsvp === undefined).length || 0;

    // Calculate overall progress (based on tasks completed, budget allocated, etc.)
    const overallProgress = 45; // TODO: Calculate from actual data

    return (
        <div>
            {/* Event Header */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', padding: '2rem' }}>
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

            {/* Overall Progress */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Overall Progress</h3>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{overallProgress}%</span>
                </div>
                <div style={{ height: '12px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${overallProgress}%`,
                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        transition: 'width 0.5s ease',
                        borderRadius: '999px'
                    }}></div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    Your event planning is {overallProgress}% complete
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Guests */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalGuests}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Guests</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--success)' }}>✓ {confirmedGuests} confirmed</span>
                        <span style={{ color: 'var(--warning)' }}>⏳ {pendingRSVP} pending</span>
                    </div>
                </div>

                {/* Check-ins */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{checkedInGuests}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Checked In</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0}% attendance rate
                    </div>
                </div>

                {/* Budget (Placeholder) */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={24} style={{ color: 'var(--warning)' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>-</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Budget</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Coming soon
                    </div>
                </div>

                {/* Tasks (Placeholder) */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>-</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tasks</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Coming soon
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                        <Users size={16} /> Manage Guests
                    </button>
                    <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                        <TrendingUp size={16} /> View Analytics
                    </button>
                    <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                        <DollarSign size={16} /> Track Budget
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
