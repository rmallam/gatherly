import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, ChevronRight, MapPin, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import ThemeToggle from '../components/ThemeToggle';

const ManagerDashboard = () => {
    const { events, createEvent, deleteEvent } = useApp();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '' });
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past'

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEvent.title || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const createdEvent = await createEvent(newEvent);

            // Celebration confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a855f7', '#ec4899', '#f472b6']
            });

            setNewEvent({ title: '', date: '', location: '' });
            setIsCreating(false);

            // Navigate to the newly created event
            if (createdEvent && createdEvent.id) {
                navigate(`/event/${createdEvent.id}`);
            }
        } catch (error) {
            console.error('Failed to create event:', error);
            alert('Failed to create event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (e, id) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this event?')) {
            deleteEvent(id);
        }
    };

    return (
        <>
            <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '16px', paddingBottom: '100px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            My Events
                        </h1>
                        <ThemeToggle />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Create and manage your events
                    </p>
                </div>

                {/* Summary Banner */}
                {events.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '20px',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '4px' }}>Overview</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                            {events.filter(e => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (!e.date) return filter === 'upcoming';
                                const eventDate = new Date(e.date);
                                eventDate.setHours(0, 0, 0, 0);
                                return filter === 'upcoming' ? eventDate >= today : eventDate < today;
                            }).length} {filter === 'upcoming' ? 'upcoming' : 'past'} {events.filter(e => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (!e.date) return filter === 'upcoming';
                                const eventDate = new Date(e.date);
                                eventDate.setHours(0, 0, 0, 0);
                                return filter === 'upcoming' ? eventDate >= today : eventDate < today;
                            }).length === 1 ? 'event' : 'events'}
                        </div>
                    </div>
                )}

                {/* Filter Tabs - Upcoming/Past */}
                {events.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setFilter('upcoming')}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === 'upcoming' ? 'var(--primary)' : 'transparent',
                                color: filter === 'upcoming' ? 'white' : 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === 'past' ? 'var(--primary)' : 'transparent',
                                color: filter === 'past' ? 'white' : 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Past
                        </button>
                    </div>
                )}

                {/* Floating Action Button */}
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        border: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                        zIndex: 1000,
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
                    }}
                    aria-label="Create New Event"
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>

                {/* Create Event Modal */}
                {isCreating && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                        onClick={() => setIsCreating(false)}>
                        <div className="card" style={{ maxWidth: '32rem', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                                Create New Event
                            </h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Event Type Selector */}
                                <div>
                                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Event Type</label>
                                    <select
                                        className="input"
                                        value={newEvent.eventType || 'host'}
                                        onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                                    >
                                        <option value="host">🎉 Host Event (Birthday, Wedding, Party)</option>
                                        <option value="shared">🌍 Shared Event (Trip, Outing, Group Activity)</option>
                                    </select>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                        {newEvent.eventType === 'shared'
                                            ? 'Everyone can add expenses and manage the event together'
                                            : 'You host, others are guests with limited permissions'}
                                    </p>
                                </div>

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
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                                        disabled={isSubmitting}
                                        style={{ minWidth: '140px' }}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Event'}
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
                            .filter(event => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0); // Reset to start of day

                                if (!event.date) {
                                    // Events without dates show in upcoming
                                    return filter === 'upcoming';
                                }

                                const eventDate = new Date(event.date);
                                eventDate.setHours(0, 0, 0, 0);

                                if (filter === 'upcoming') {
                                    return eventDate >= today;
                                } else if (filter === 'past') {
                                    return eventDate < today;
                                }
                                return true;
                            })
                            .sort((a, b) => {
                                // Sort by date - upcoming events first
                                if (!a.date && !b.date) return 0;
                                if (!a.date) return 1;
                                if (!b.date) return -1;
                                return new Date(a.date) - new Date(b.date);
                            })
                            .map(event => {
                                const isGuest = event.role === 'guest';
                                const isSharedEvent = event.event_type === 'shared';
                                // Shared event participants get full access, only host event guests get limited view
                                const linkPath = (isGuest && !isSharedEvent) ? `/guest/event/${event.id}` : `/event/${event.id}`;

                                return (
                                    <Link to={linkPath} key={event.id} style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'var(--bg-primary)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            border: '1px solid var(--border)',
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
                                                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word', lineHeight: '1.3' }}>
                                                        {event.title}
                                                    </h3>
                                                    {isSharedEvent && (
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
                                                            color: 'var(--primary)',
                                                            borderRadius: '12px',
                                                            fontSize: '10px',
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            flexShrink: 0,
                                                            border: '1px solid var(--primary)'
                                                        }}>
                                                            SHARED
                                                        </span>
                                                    )}
                                                    {isGuest && !isSharedEvent && (
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
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
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
                                                        id={`delete-event-from-list-${event.id}`}
                                                        data-testid={`delete-event-from-list-${event.id}`}
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
                            }))}
                    </div>
                )}
            </div>

            {/* Floating Action Button - Outside container for proper fixed positioning */}
            <button
                onClick={() => setIsCreating(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                    zIndex: 1000,
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
                }}
                aria-label="Create New Event"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>
        </>
    );
};

export default ManagerDashboard;
