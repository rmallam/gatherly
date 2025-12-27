import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TabNavigation from '../components/TabNavigation';
import OverviewTab from '../components/tabs/OverviewTab';
import CateringTab from '../components/tabs/CateringTab';

import TasksTab from '../components/tabs/TasksTab';
import VenueTab from '../components/tabs/VenueTab';
import DecorationsTab from '../components/tabs/DecorationsTab';
import GiftsTab from '../components/tabs/GiftsTab';
import EntertainmentTab from '../components/tabs/EntertainmentTab';
import VendorsTab from '../components/tabs/VendorsTab';
import BudgetTab from '../components/tabs/BudgetTab';
import RemindersSettings from '../components/RemindersSettings';
import MessagesTab from '../components/tabs/MessagesTab';
import { LayoutDashboard, Users, UtensilsCrossed, CheckSquare, MapPin, Sparkles, Gift, Music, Briefcase, DollarSign, Bell, MessageCircle, ArrowLeft, Trash2 } from 'lucide-react';

// Import the old EventDetails as a component for the Guests tab temporarily
import EventDetails from './EventDetails';

const EventDetailsTabs = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getEvent, updateEvent, deleteEvent } = useApp();
    const event = getEvent(id);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);

    if (!event) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Event not found</h2>
                <Link to="/manager" className="btn btn-secondary">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    const handleUpdateCatering = (items) => {
        updateEvent(id, {
            ...event,
            catering: { items }
        });
    };



    const handleUpdateTasks = (tasks) => {
        updateEvent(id, {
            ...event,
            tasks
        });
    };

    const handleUpdateVenue = (venue) => {
        updateEvent(id, {
            ...event,
            venue
        });
    };

    const handleUpdateDecorations = (decorations) => {
        updateEvent(id, { ...event, decorations });
    };

    const handleUpdateGifts = (gifts) => {
        updateEvent(id, { ...event, gifts });
    };

    const handleUpdateEntertainment = (entertainment) => {
        updateEvent(id, { ...event, entertainment });
    };

    const handleUpdateVendors = (vendors) => {
        updateEvent(id, { ...event, vendors });
    };

    const handleDeleteEvent = async () => {
        try {
            await deleteEvent(id);
            setShowDeleteEventConfirm(false);
            navigate('/manager');
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Failed to delete event. Please try again.');
        }
    };

    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            icon: LayoutDashboard,
        },
        {
            id: 'guests',
            label: 'Guests',
            icon: Users,
            badge: event.guests?.length || 0
        },
        {
            id: 'catering',
            label: 'Catering',
            icon: UtensilsCrossed,
            badge: event.catering?.items?.length || null
        },

        {
            id: 'tasks',
            label: 'Tasks',
            icon: CheckSquare,
            badge: event.tasks?.length || null
        },
        {
            id: 'venue',
            label: 'Venue',
            icon: MapPin,
            badge: null
        },
        { id: 'decorations', label: 'Decorations', icon: Sparkles, badge: event.decorations?.items?.length || null },
        { id: 'gifts', label: 'Gifts', icon: Gift, badge: event.gifts?.items?.length || null },
        { id: 'entertainment', label: 'Entertainment', icon: Music, badge: event.entertainment?.activities?.length || null },
        { id: 'vendors', label: 'Vendors', icon: Briefcase, badge: event.vendors?.length || null },
        { id: 'budget', label: 'Budget', icon: DollarSign, badge: null },
        { id: 'reminders', label: 'Reminders', icon: Bell, badge: null },
        { id: 'messages', label: 'Messages', icon: MessageCircle, badge: null }
    ];

    return (
        <div style={{ maxWidth: '75rem', margin: '0 auto', padding: '16px' }}>
            {/* Header with Back Button and Event Wall */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                        to="/manager"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Events
                    </Link>
                    <button
                        onClick={() => setShowDeleteEventConfirm(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#ef4444',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                        <Trash2 size={14} /> Delete Event
                    </button>
                </div>

                <Link
                    to={`/event/${id}/wall`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '14px',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)';
                    }}
                >
                    <MessageCircle size={18} strokeWidth={2.5} /> Event Wall
                </Link>
            </div>

            {/* Tab Navigation */}
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && <OverviewTab event={event} />}
                {activeTab === 'guests' && <EventDetails />}
                {activeTab === 'catering' && <CateringTab event={event} onUpdateCatering={handleUpdateCatering} />}

                {activeTab === 'tasks' && <TasksTab event={event} onUpdateTasks={handleUpdateTasks} />}
                {activeTab === 'venue' && <VenueTab event={event} onUpdateVenue={handleUpdateVenue} />}
                {activeTab === 'decorations' && <DecorationsTab event={event} onUpdateDecorations={handleUpdateDecorations} />}
                {activeTab === 'gifts' && <GiftsTab event={event} onUpdateGifts={handleUpdateGifts} />}
                {activeTab === 'entertainment' && <EntertainmentTab event={event} onUpdateEntertainment={handleUpdateEntertainment} />}
                {activeTab === 'vendors' && <VendorsTab event={event} onUpdateVendors={handleUpdateVendors} />}
                {activeTab === 'budget' && <BudgetTab event={event} />}
                {activeTab === 'reminders' && <RemindersSettings event={event} />}
                {activeTab === 'messages' && <MessagesTab event={event} />}
            </div>

            {/* Delete Event Confirmation Modal */}
            {showDeleteEventConfirm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={() => setShowDeleteEventConfirm(false)}>
                    <div style={{ maxWidth: '400px', width: '100%', padding: '2rem', background: 'var(--bg-primary)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Delete Event?</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Are you sure you want to delete <strong>{event.title}</strong>? This will permanently delete the event and all {event.guests?.length || 0} guest{event.guests?.length !== 1 ? 's' : ''}. This action cannot be undone.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => setShowDeleteEventConfirm(false)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        background: '#ef4444',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Trash2 size={16} /> Delete Event
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailsTabs;
