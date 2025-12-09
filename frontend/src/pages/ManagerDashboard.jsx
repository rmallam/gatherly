import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, ChevronRight, MapPin, Users } from 'lucide-react';

const ManagerDashboard = () => {
    const { events, createEvent, deleteEvent } = useApp();
    const [isCreating, setIsCreating] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newEvent.title) return;
        createEvent(newEvent);
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
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Your Events
                    </h1>
                    <button onClick={() => setIsCreating(true)} className="btn btn-primary">
                        <Plus size={18} /> New Event
                    </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Create and manage events for your organization
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
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {events.map(event => (
                        <Link to={`/event/${event.id}`} key={event.id} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                    {/* Date Badge */}
                                    <div style={{ width: '4rem', height: '4rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            {event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : 'TBD'}
                                        </span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                            {event.date ? new Date(event.date).getDate() : '?'}
                                        </span>
                                    </div>

                                    {/* Event Details */}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                                            {event.title}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {event.location && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <MapPin size={14} />
                                                    {event.location}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Users size={14} />
                                                {event.guests?.length || 0} guests
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button
                                        onClick={(e) => handleDelete(e, event.id)}
                                        style={{ padding: '0.5rem', color: 'var(--text-tertiary)', transition: 'color 0.2s', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        title="Delete Event"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
