import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, ChevronRight, MapPin, Users, Sparkles, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import RateAppService from '../services/RateAppService';
import UpgradeModal from '../components/UpgradeModal';
import { countries } from '../utils/currencyUtils';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import DashboardTour from '../components/tours/DashboardTour';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
    const { events, createEvent, deleteEvent } = useApp();
    const { user } = useAuth();
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "G'day"; // or 'Good morning'
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };
    
    const firstName = user?.name ? user.name.split(' ')[0] : '';
    
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeTriggerReason, setUpgradeTriggerReason] = useState('');

    const checkLimitAndOpen = () => {
        const isFree = !user?.subscription_tier || user?.subscription_tier === 'free';
        // Use backend count if available, otherwise fallback to local length
        const currentCount = user?.event_count !== undefined ? user.event_count : events.length;

        if (isFree && currentCount >= 3) {
            setUpgradeTriggerReason('You have reached the limit of 3 events on the Free plan. Please upgrade to Pro to create unlimited events.');
            setShowUpgradeModal(true);
            return;
        }
        setIsCreating(true);
    };

    // DEBUG: Verify Build Version
    React.useEffect(() => {
        console.log('Build Version: 2026-01-11 11:25 - Header Blur Added');
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', country: 'US' });
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past'
    const [error, setError] = useState('');
    // Safety cleanup for confetti
    React.useEffect(() => {
        return () => confetti.reset();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!newEvent.title.trim()) {
            setError('Please enter an event title');
            return;
        }

        if (!newEvent.description?.trim()) {
            setError('Please enter an event theme or vibe for the AI Assistant');
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const createdEvent = await createEvent(newEvent);

            // Celebration confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a855f7', '#ec4899', '#f472b6'],
                zIndex: 2000 // Ensure it's on top
            });

            setNewEvent({ title: '', description: '', date: '', location: '', country: 'US' });
            setIsCreating(false);

            // Navigate to the newly created event
            if (createdEvent && createdEvent.id) {
                // Trigger growth loop rating check
                RateAppService.checkAndPrompt('create_event');
                navigate(`/event/${createdEvent.id}`);
            }
        } catch (error) {
            console.error('Failed to create event:', error);
            const errMsg = error.message?.toLowerCase() || '';

            if (errMsg.includes('limit') || errMsg.includes('upgrade') || errMsg.includes('plan')) {
                setUpgradeTriggerReason(error.message);
                setShowUpgradeModal(true);
                setIsCreating(false);
            } else {
                alert(error.message || 'Failed to create event. Please try again.');
            }
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
            <DashboardTour />

            <div className="dashboard-container">
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 16px 0' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#ffffff' }}>
                            {getGreeting()}{firstName ? `, ${firstName}` : ''}! 👋
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9375rem', margin: 0 }}>
                            Manage all your events in one place
                        </p>
                    </div>
                </div>

                {/* Filter Tabs - Upcoming/Past */}
                {events.length > 0 && (
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '16px' }}>
                        <button
                            className="tour-upcoming-tab"
                            onClick={() => setFilter('upcoming')}
                            style={{
                                flex: 1,
                                padding: '12px 0',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: filter === 'upcoming' ? '2px solid #10b981' : '2px solid transparent',
                                color: filter === 'upcoming' ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
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
                                padding: '12px 0',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: filter === 'past' ? '2px solid #10b981' : '2px solid transparent',
                                color: filter === 'past' ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Past
                        </button>
                    </div>
                )}



                {/* Create Event Fullscreen Overlay */}
                {isCreating && (
                    <div className="create-event-fullscreen">
                        <div className="create-event-header">
                            <button className="create-event-close" onClick={() => setIsCreating(false)} type="button">
                                <span style={{fontSize: '28px', fontWeight: '300', lineHeight: 1}}>×</span>
                            </button>
                            <h2 className="create-event-title">Create an event</h2>
                            <button 
                                className="create-event-done" 
                                onClick={handleSubmit}
                                disabled={isSubmitting || !newEvent.title.trim()}
                                type="button"
                            >
                                Done
                            </button>
                        </div>
                        
                        <div className="create-event-body">
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Hero Input */}
                                <div className="create-event-hero-row">
                                    <div className="create-event-icon-btn">
                                        <Sparkles size={20} color="#a1a1aa" />
                                    </div>
                                    <div className="create-event-title-wrapper">
                                        <label className="create-event-tiny-label">Event name</label>
                                        <input
                                            type="text"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            className="create-event-title-input"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="create-event-section">
                                    <label className="create-event-label">Type</label>
                                    <div className="create-event-type-scroll">
                                        <div
                                            onClick={() => setNewEvent({ ...newEvent, eventType: 'host' })}
                                            className={`create-event-type-pill ${newEvent.eventType !== 'shared' ? 'active' : ''}`}
                                        >
                                            <span className="icon">🎉</span>
                                            <span>Host Event</span>
                                        </div>
                                        <div
                                            onClick={() => setNewEvent({ ...newEvent, eventType: 'shared' })}
                                            className={`create-event-type-pill ${newEvent.eventType === 'shared' ? 'active' : ''}`}
                                        >
                                            <span className="icon">💶</span>
                                            <span>Split Expense</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="create-event-section">
                                    <label className="create-event-label">Details</label>
                                    <div className="create-event-list">
                                        {/* Theme */}
                                        <div className="create-event-list-row">
                                            <Sparkles size={18} color="#a1a1aa" className="row-icon" />
                                            <input
                                                type="text"
                                                value={newEvent.description || ''}
                                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                className="create-event-list-input"
                                                placeholder="Theme or Vibe (e.g. 80s Retro)"
                                            />
                                        </div>
                                        
                                        {/* Date */}
                                        <div className="create-event-list-row">
                                            <Calendar size={18} color="#a1a1aa" className="row-icon" />
                                            <input
                                                type="date"
                                                value={newEvent.date}
                                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                                className="create-event-list-input"
                                                placeholder="Select Date"
                                            />
                                        </div>
                                        
                                        {/* Location */}
                                        <div className="create-event-list-row">
                                            <MapPin size={18} color="#a1a1aa" className="row-icon" />
                                            <div style={{ flex: 1, padding: '12px 0' }}>
                                                <LocationAutocomplete
                                                    value={newEvent.location}
                                                    onChange={(val) => setNewEvent(prev => ({ ...prev, location: val, venue: null }))}
                                                    onSelect={(place) => {
                                                        setNewEvent(prev => ({
                                                            ...prev,
                                                            location: place.name || place.formatted_address,
                                                            venue: {
                                                                name: place.name || place.formatted_address,
                                                                address: place.formatted_address || ''
                                                            }
                                                        }));
                                                    }}
                                                    placeholder="Location (e.g. Grand Hall)"
                                                />
                                            </div>
                                        </div>

                                        {/* Region */}
                                        <div className="create-event-list-row">
                                            <span className="row-icon" style={{ fontSize: '18px' }}>🌍</span>
                                            <select
                                                value={newEvent.country || 'US'}
                                                onChange={(e) => setNewEvent({ ...newEvent, country: e.target.value })}
                                                className="create-event-list-input select-input"
                                            >
                                                {countries.map(c => (
                                                    <option key={c.code} value={c.code}>
                                                        {c.name} ({c.currency})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="create-event-error">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Events List */}
                {
                    events.length === 0 ? (
                        <div className="onboarding-empty-state">
                            <div className="onboarding-icon-circle">
                                <Sparkles size={40} />
                            </div>
                            <h2 className="onboarding-title">Welcome to HostEze 🎉</h2>
                            <p className="onboarding-description">
                                Your all-in-one companion for perfect events. <br />
                                Manage guests, track budgets, and split expenses seamlessly.
                            </p>

                            <div className="onboarding-features">
                                <div className="feature-pill"><Users size={16} /> Guest List</div>
                                <div className="feature-pill"><Calendar size={16} /> Scheduler</div>
                                <div className="feature-pill"><CheckCircle size={16} /> RSVPs</div>
                            </div>

                            <button
                                onClick={checkLimitAndOpen}
                                className="onboarding-btn-large"
                            >
                                <Plus size={24} /> Create Your First Event <ArrowRight size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="event-list">
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
                                    
                                    const iconClass = isGuest ? 'guest' : (isSharedEvent ? 'shared' : 'host');

                                    return (
                                        <Link to={linkPath} key={event.id} className="event-list-item">
                                            {/* Icon Badge */}
                                            <div className={`event-list-icon ${iconClass}`}>
                                                <span className="month">
                                                    {event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : 'TBD'}
                                                </span>
                                                <span className="day">
                                                    {event.date ? new Date(event.date).getDate() : '?'}
                                                </span>
                                            </div>

                                            {/* Event Details */}
                                            <div className="event-list-details">
                                                <div className="event-list-title-row">
                                                    <h3 className="event-list-title">
                                                        {event.title}
                                                    </h3>
                                                    {isSharedEvent && (
                                                        <span className="event-list-badge shared">SHARED</span>
                                                    )}
                                                    {isGuest && !isSharedEvent && (
                                                        <span className="event-list-badge guest">GUEST</span>
                                                    )}
                                                </div>
                                                <div className="event-list-meta">
                                                    {!isGuest && (
                                                        <div>
                                                            {event.guests?.length || 0} {event.guests?.length === 1 ? 'guest' : 'guests'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="event-list-actions">
                                                {!isGuest && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Prevent link click
                                                            e.stopPropagation();
                                                            handleDelete(e, event.id);
                                                        }}
                                                        id={`delete-event-from-list-${event.id}`}
                                                        className="event-list-delete-btn"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <ChevronRight size={18} className="event-list-chevron" />
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    )
                }
            </div >

            {/* Floating Action Button */}
            <button
                className="fab-create-btn"
                onClick={checkLimitAndOpen}
                aria-label="Create New Event"
            >
                <Plus size={20} strokeWidth={2.5} />
                <span>Add event</span>
            </button>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                triggerReason={upgradeTriggerReason}
            />
        </>
    );
};

export default ManagerDashboard;
