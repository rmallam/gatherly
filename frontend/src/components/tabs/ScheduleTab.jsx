import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import ScheduleItemCard from './ScheduleItemCard';
import AddScheduleItemModal from './AddScheduleItemModal';

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
        // Sort by start_time, nulls last
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
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading schedule...
            </div>
        );
    }

    return (
        <div>
            {/* Date Selector */}
            <div style={{
                marginBottom: '2rem',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    paddingBottom: '0.5rem',
                    minWidth: 'min-content'
                }}>
                    {dates.map((date, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            style={{
                                padding: '1rem 1.5rem',
                                borderRadius: 'var(--radius-lg)',
                                border: selectedDate?.toDateString() === date.toDateString()
                                    ? '2px solid var(--primary)'
                                    : '1px solid var(--border)',
                                background: selectedDate?.toDateString() === date.toDateString()
                                    ? 'var(--primary)'
                                    : 'var(--bg-primary)',
                                color: selectedDate?.toDateString() === date.toDateString()
                                    ? 'white'
                                    : 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap',
                                position: 'relative'
                            }}
                        >
                            {formatDate(date)}
                            {isToday(date) && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0.25rem',
                                    right: '0.25rem',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: selectedDate?.toDateString() === date.toDateString()
                                        ? 'white'
                                        : 'var(--primary)'
                                }}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Activity Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
                style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <Plus size={20} />
                Add Activity
            </button>

            {/* Schedule Items */}
            {selectedDateItems.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <CalendarIcon size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-tertiary)' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        No activities planned
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Add activities to plan your day
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedDateItems.map(item => (
                        <ScheduleItemCard
                            key={item.id}
                            item={item}
                            eventId={event.id}
                            onUpdate={fetchScheduleItems}
                            onDelete={fetchScheduleItems}
                        />
                    ))}
                </div>
            )}

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
