import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TabNavigation from '../components/TabNavigation';
import OverviewTab from '../components/tabs/OverviewTab';
import PlanningTab from '../components/tabs/PlanningTab';
import ScheduleTab from '../components/tabs/ScheduleTab';
import GalleryTab from '../components/tabs/GalleryTab';
import MessagesTab from '../components/tabs/MessagesTab';
import { LayoutDashboard, Users, MessageCircle, ArrowLeft, Trash2, Calendar, Image as ImageIcon, ClipboardList, DollarSign } from 'lucide-react';

import './EventDetails.css';

// Import the old EventDetails as a component for the Guests tab temporarily
import EventDetails from './EventDetails';
import ExpensesDashboard from '../components/expenses/ExpensesDashboard';
import EventDetailsTour from '../components/tours/EventDetailsTour';

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
        { id: 'planning', label: 'Planning', icon: ClipboardList, badge: null },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon, badge: null },
        { id: 'messages', label: 'Messages', icon: MessageCircle, badge: null }
    ];

    // Tabs for Shared Events (Trip, Outing, Group Activity)
    const sharedEventTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'schedule', label: 'Schedule', icon: Calendar, badge: null },
        { id: 'guests', label: 'Participants', icon: Users, badge: event.guests?.length || 0 },
        { id: 'expenses', label: 'Expenses', icon: DollarSign, badge: null },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon, badge: null },
        { id: 'messages', label: 'Messages', icon: MessageCircle, badge: null }
    ];

    const tabs = isSharedEvent ? sharedEventTabs : hostEventTabs;

    return (
        <div className="event-details-container">
            <EventDetailsTour />
            {/* Sticky Event Title Header */}
            <div className="event-header-sticky">
                <div className="event-header-title-group">
                    <button
                        onClick={() => navigate('/manager')}
                        className="event-back-btn"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="event-title">
                        {event.title}
                    </h1>
                </div>
                <div className="event-header-actions">
                    <Link
                        to={`/event/${id}/wall`}
                        className="btn-wall"
                    >
                        <MessageCircle size={16} strokeWidth={2.5} /> Wall
                    </Link>
                    <button
                        onClick={() => setShowDeleteEventConfirm(true)}
                        id="delete-event-button"
                        data-testid="delete-event-button"
                        className="btn-delete-event"
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
                        className="tabs-collapse-btn"
                    >
                        {tabsCollapsed ? '▶' : '▼'} {tabsCollapsed ? 'Show Tabs' : 'Hide Tabs'}
                    </button>
                    {!tabsCollapsed && (
                        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    )}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'overview' && <OverviewTab event={event} onTabChange={setActiveTab} />}
                    {activeTab === 'schedule' && <ScheduleTab event={event} />}
                    {activeTab === 'guests' && <EventDetails />}
                    {activeTab === 'expenses' && <ExpensesDashboard eventId={id} event={event} />}
                    
                    {activeTab === 'planning' && (
                        <PlanningTab 
                            event={event} 
                            handleUpdateCatering={handleUpdateCatering}
                            handleUpdateTasks={handleUpdateTasks}
                            handleUpdateVenue={handleUpdateVenue}
                            handleUpdateDecorations={handleUpdateDecorations}
                            handleUpdateGifts={handleUpdateGifts}
                            handleUpdateEntertainment={handleUpdateEntertainment}
                            handleUpdateVendors={handleUpdateVendors}
                        />
                    )}

                    {activeTab === 'gallery' && <GalleryTab event={event} />}
                    {activeTab === 'messages' && <MessagesTab event={event} />}
                </div>

                {/* Delete Event Confirmation Modal */}
                {showDeleteEventConfirm && (
                    <div className="glass-modal-overlay" onClick={() => setShowDeleteEventConfirm(false)}>
                        <div className="glass-modal-content" onClick={e => e.stopPropagation()}>
                            <h3>Delete Event?</h3>
                            <p>
                                Are you sure you want to delete <strong>{event.title}</strong>? This will permanently delete the event and all {event.guests?.length || 0} guest{event.guests?.length !== 1 ? 's' : ''}. This action cannot be undone.
                            </p>
                            <div className="glass-modal-actions">
                                <button
                                    onClick={() => setShowDeleteEventConfirm(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    id="confirm-delete-event-button"
                                    data-testid="confirm-delete-event-button"
                                    className="btn-danger-solid"
                                >
                                    <Trash2 size={16} /> Delete Event
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetailsTabs;
