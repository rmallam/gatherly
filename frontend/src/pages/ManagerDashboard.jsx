import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, ChevronRight, MapPin, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

const ManagerDashboard = () => {
    const { events, createEvent, deleteEvent } = useApp();
    const [isCreating, setIsCreating] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newEvent.title) return;
        createEvent(newEvent);

        // Celebration confetti!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#ec4899', '#f472b6']
        });

        setNewEvent({ title: '', date: '', location: '' });
        setIsCreating(false);
    };

    const handleDelete = (e, id) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this event?')) {
            deleteEvent(id);
        }
    };

    return (
        <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '16px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                        My Events
                    </h1>
                    <button onClick={() => setIsCreating(true)} className="btn btn-primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                        <Plus size={16} /> New Event
                    </button>
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                    Create and manage your events
                </p>
            </div>

            {/* Create Event Modal */}
            {isCreating && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setIsCreating(false)}>
                    <div className="card" style={{ maxWidth: '32rem', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                            Create New Event
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Event Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Annual Conference 2024"
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location</label>
                                    <input
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                        className="input"
                                        placeholder="Grand Hall"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Events List */}
            {events.length === 0 ? (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                    <div style={{ width: '4rem', height: '4rem', margin: '0 auto 1.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                        <Calendar size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No events yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Click "New Event" to create your first event</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {events
                        .sort((a, b) => {
                            // Sort by date - upcoming events first
                            if (!a.date && !b.date) return 0;
                            if (!a.date) return 1;
                            if (!b.date) return -1;
                            return new Date(a.date) - new Date(b.date);
                        })
                        .map(event => {
                            const isGuest = event.role === 'guest';
                            const linkPath = isGuest ? `/guest/event/${event.id}` : `/event/${event.id}`;

                            return (
                                <Link to={linkPath} key={event.id} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                        }}>
                                        {/* Date Badge */}
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            background: isGuest ? 'linear-gradient(135deg, #60a5fa, #3b82f6)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            color: 'white'
                                        }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
                                                {event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : 'TBD'}
                                            </span>
                                            <span style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>
                                                {event.date ? new Date(event.date).getDate() : '?'}
                                            </span>
                                        </div>

                                        {/* Event Details */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {event.title}
                                                </h3>
                                                {isGuest && (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        background: '#dbeafe',
                                                        color: '#1e40af',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        flexShrink: 0
                                                    }}>
                                                        GUEST
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                                                {event.location && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        <MapPin size={12} />
                                                        {event.location}
                                                    </span>
                                                )}
                                                {!isGuest && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Users size={12} />
                                                        {event.guests?.length || 0}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            {!isGuest && (
                                                <button
                                                    onClick={(e) => handleDelete(e, event.id)}
                                                    style={{
                                                        padding: '8px',
                                                        color: '#9ca3af',
                                                        transition: 'all 0.2s',
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#fee2e2';
                                                        e.currentTarget.style.color = '#ef4444';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'none';
                                                        e.currentTarget.style.color = '#9ca3af';
                                                    }}
                                                    title="Delete Event"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <ChevronRight size={18} style={{ color: '#9ca3af' }} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
