import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import { Plus, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import ScheduleItemCard from './ScheduleItemCard';
import AddScheduleItemModal from './AddScheduleItemModal';
import '../../pages/EventTabs.css';

const ScheduleTab = ({ event }) => {
    const [scheduleItems, setScheduleItems] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dates, setDates] = useState([]);

    // Generate date range from event start to end (or +7 days if no end date)
    useEffect(() => {
        if (!event?.date) return;

        const startDate = new Date(event.date);
        const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        const dateArray = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dateArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setDates(dateArray);
        setSelectedDate(dateArray[0]);
    }, [event]);

    // Fetch schedule items
    const fetchScheduleItems = async () => {
        if (!event?.id) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/schedule`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setScheduleItems(data.scheduleItems || []);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScheduleItems();
    }, [event?.id]);

    // Filter items for selected date
    const selectedDateItems = scheduleItems.filter(item => {
        if (!selectedDate) return false;
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === selectedDate.toDateString();
    }).sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return a.start_time.localeCompare(b.start_time);
    });

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    if (loading) {
        return <div className="tab-empty-state">Loading schedule...</div>;
    }

    return (
        <div className="event-tab-page">
            {/* Date Selector (Pill Scroll) */}
            <div className="date-picker-scroll">
                {dates.map((date, index) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            className={`date-pill ${isSelected ? 'active' : ''}`}
                        >
                            {isToday(date) && <span style={{ marginRight: 6 }}>●</span>}
                            {formatDate(date)}
                        </button>
                    );
                })}
            </div>

            {/* Empty State */}
            {selectedDateItems.length === 0 ? (
                <div className="tab-empty-state">
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        color: 'var(--text-tertiary)'
                    }}>
                        <CalendarIcon size={32} />
                    </div>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>Nothing planned yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Add activities for this day.</p>
                </div>
            ) : (
                <div className="tab-list">
                    {/* Schedule List */}
                    {selectedDateItems.map(item => (
                        <ScheduleItemCard
                            key={item.id}
                            item={item}
                            eventId={event.id}
                            onUpdate={fetchScheduleItems}
                            onDelete={fetchScheduleItems}
                        />
                    ))}
                    <div style={{ height: 80 }} /> {/* Spacer for FAB */}
                </div>
            )}

            {/* FAB */}
            <button
                className="btn-floating-action"
                onClick={() => setShowAddModal(true)}
            >
                <Plus size={24} />
            </button>

            {/* Add Schedule Item Modal */}
            {showAddModal && (
                <AddScheduleItemModal
                    event={event}
                    selectedDate={selectedDate}
                    onClose={() => setShowAddModal(false)}
                    onItemAdded={() => {
                        fetchScheduleItems();
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ScheduleTab;
