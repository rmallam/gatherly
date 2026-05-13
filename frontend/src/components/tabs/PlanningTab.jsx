import React, { useState } from 'react';
import { ArrowLeft, UtensilsCrossed, CheckSquare, MapPin, Sparkles, Gift, Music, Briefcase, DollarSign, Bell } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Import all sub-components
import CateringTab from './CateringTab';
import TasksTab from './TasksTab';
import VenueTab from './VenueTab';
import DecorationsTab from './DecorationsTab';
import GiftsTab from './GiftsTab';
import EntertainmentTab from './EntertainmentTab';
import VendorsTab from './VendorsTab';
import BudgetTab from './BudgetTab';
import RemindersSettings from '../RemindersSettings';

const PlanningTab = ({ 
    event, 
    handleUpdateCatering,
    handleUpdateTasks,
    handleUpdateVenue,
    handleUpdateDecorations,
    handleUpdateGifts,
    handleUpdateEntertainment,
    handleUpdateVendors 
}) => {
    const [activeSection, setActiveSection] = useState(null);

    // Configuration for the planning dashboard grid
    const sections = [
        { id: 'catering', label: 'Catering', icon: UtensilsCrossed, badge: event.catering?.items?.length },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: event.tasks?.length },
        { id: 'venue', label: 'Venue', icon: MapPin },
        { id: 'decorations', label: 'Decorations', icon: Sparkles, badge: event.decorations?.items?.length },
        { id: 'gifts', label: 'Gifts', icon: Gift, badge: event.gifts?.items?.length },
        { id: 'entertainment', label: 'Entertainment', icon: Music, badge: event.entertainment?.activities?.length },
        { id: 'vendors', label: 'Vendors', icon: Briefcase, badge: event.vendors?.length },
        { id: 'budget', label: 'Budget', icon: DollarSign },
        { id: 'reminders', label: 'Reminders', icon: Bell }
    ];

    const handleSectionClick = async (id) => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Ignore on web
        }
        setActiveSection(id);
    };

    const handleBackClick = async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Ignore on web
        }
        setActiveSection(null);
    };

    // Render the specific sub-tool
    if (activeSection) {
        return (
            <div className="sub-tab-container">
                <button 
                    onClick={handleBackClick} 
                    className="back-to-planning-btn"
                >
                    <ArrowLeft size={16} /> Back to Planning
                </button>
                
                <div className="sub-tab-content">
                    {activeSection === 'catering' && <CateringTab event={event} onUpdateCatering={handleUpdateCatering} />}
                    {activeSection === 'tasks' && <TasksTab event={event} onUpdateTasks={handleUpdateTasks} />}
                    {activeSection === 'venue' && <VenueTab event={event} onUpdateVenue={handleUpdateVenue} />}
                    {activeSection === 'decorations' && <DecorationsTab event={event} onUpdateDecorations={handleUpdateDecorations} />}
                    {activeSection === 'gifts' && <GiftsTab event={event} onUpdateGifts={handleUpdateGifts} />}
                    {activeSection === 'entertainment' && <EntertainmentTab event={event} onUpdateEntertainment={handleUpdateEntertainment} />}
                    {activeSection === 'vendors' && <VendorsTab event={event} onUpdateVendors={handleUpdateVendors} />}
                    {activeSection === 'budget' && <BudgetTab event={event} />}
                    {activeSection === 'reminders' && <RemindersSettings event={event} />}
                </div>
            </div>
        );
    }

    // Render the main Planning Dashboard grid
    return (
        <div className="planning-dashboard">
            <div className="planning-grid">
                {sections.map(section => (
                    <div 
                        key={section.id} 
                        className="planning-card"
                        onClick={() => handleSectionClick(section.id)}
                    >
                        <div className="planning-icon-wrapper">
                            <section.icon size={24} strokeWidth={2} />
                        </div>
                        <h3>{section.label}</h3>
                        {section.badge ? (
                            <span className="planning-badge">{section.badge}</span>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanningTab;
