import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { LayoutDashboard, Users, UtensilsCrossed, CheckSquare, MapPin, Sparkles, Gift, Music, Briefcase, ArrowLeft } from 'lucide-react';

// Import the old EventDetails as a component for the Guests tab temporarily
import EventDetails from './EventDetails';

const EventDetailsTabs = () => {
    const { id } = useParams();
    const { getEvent, updateEvent } = useApp();
    const event = getEvent(id);
    const [activeTab, setActiveTab] = useState('overview');

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
        { id: 'vendors', label: 'Vendors', icon: Briefcase, badge: event.vendors?.length || null }
    ];

    return (
        <div style={{ maxWidth: '75rem', margin: '0 auto' }}>
            {/* Back Button */}
            <Link
                to="/manager"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                }}
            >
                <ArrowLeft size={16} /> Back to Events
            </Link>

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
            </div>
        </div>
    );
};

export default EventDetailsTabs;
