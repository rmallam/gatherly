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
import ScheduleTab from '../components/tabs/ScheduleTab';
import { LayoutDashboard, Users, UtensilsCrossed, CheckSquare, MapPin, Sparkles, Gift, Music, Briefcase, DollarSign, Bell, MessageCircle, ArrowLeft, Trash2, Calendar } from 'lucide-react';

// Import the old EventDetails as a component for the Guests tab temporarily
import EventDetails from './EventDetails';
import ExpensesDashboard from '../components/expenses/ExpensesDashboard';

const EventDetailsTabs = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getEvent, updateEvent, deleteEvent } = useApp();
    const event = getEvent(id);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);
    const [tabsCollapsed, setTabsCollapsed] = useState(false);

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

    const isSharedEvent = event.event_type === 'shared';

    // Tabs for Host Events (Birthday, Wedding, Party)
    const hostEventTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'guests', label: 'Guests', icon: Users, badge: event.guests?.length || 0 },
        { id: 'catering', label: 'Catering', icon: UtensilsCrossed, badge: event.catering?.items?.length || null },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: event.tasks?.length || null },
        { id: 'venue', label: 'Venue', icon: MapPin, badge: null },
        { id: 'decorations', label: 'Decorations', icon: Sparkles, badge: event.decorations?.items?.length || null },
        { id: 'gifts', label: 'Gifts', icon: Gift, badge: event.gifts?.items?.length || null },
        { id: 'entertainment', label: 'Entertainment', icon: Music, badge: event.entertainment?.activities?.length || null },
        { id: 'vendors', label: 'Vendors', icon: Briefcase, badge: event.vendors?.length || null },
        { id: 'budget', label: 'Budget', icon: DollarSign, badge: null },
        { id: 'reminders', label: 'Reminders', icon: Bell, badge: null },
        { id: 'messages', label: 'Messages', icon: MessageCircle, badge: null }
    ];

    // Tabs for Shared Events (Trip, Outing, Group Activity)
    const sharedEventTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'schedule', label: 'Schedule', icon: Calendar, badge: null },
        { id: 'guests', label: 'Participants', icon: Users, badge: event.guests?.length || 0 },
        { id: 'expenses', label: 'Expenses', icon: DollarSign, badge: null },
        { id: 'messages', label: 'Messages', icon: MessageCircle, badge: null }
    ];

    const tabs = isSharedEvent ? sharedEventTabs : hostEventTabs;

    return (
        <div style={{ maxWidth: '75rem', margin: '0 auto' }}>
            {/* Sticky Event Title Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <button
                        onClick={() => navigate('/manager')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '8px'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {event.name}
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link
                        to={`/event/${id}/wall`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '13px',
                            textDecoration: 'none',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
                        }}
                    >
                        <MessageCircle size={16} strokeWidth={2.5} /> Wall
                    </Link>
                    <button
                        onClick={() => setShowDeleteEventConfirm(true)}
                        id="delete-event-button"
                        data-testid="delete-event-button"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#ef4444',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer'
                        }}
                        title="Delete Event"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                {/* Tab Navigation with Collapse Toggle */}
                <div style={{ marginBottom: '16px' }}>
                    <button
                        onClick={() => setTabsCollapsed(!tabsCollapsed)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '8px 0',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '8px'
                        }}
                    >
                        {tabsCollapsed ? '▶' : '▼'} {tabsCollapsed ? 'Show Tabs' : 'Hide Tabs'}
                    </button>
                    {!tabsCollapsed && (
                        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    )}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'overview' && <OverviewTab event={event} />}
                    {activeTab === 'schedule' && <ScheduleTab event={event} />}
                    {activeTab === 'guests' && <EventDetails />}
                    {activeTab === 'expenses' && <ExpensesDashboard eventId={id} event={event} />}
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
                                        id="confirm-delete-event-button"
                                        data-testid="confirm-delete-event-button"
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
        </div>
    );
};

export default EventDetailsTabs;
