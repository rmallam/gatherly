import React from 'react';
import API_URL from '../../config/api';
import { Trash2, MapPin, DollarSign, Users, Clock } from 'lucide-react';
import '../../pages/EventTabs.css';
import { formatCurrency } from '../../utils/currencyUtils';

const ScheduleItemCard = ({ item, event, eventId, onUpdate, onDelete }) => {

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${eventId}/schedule/${item.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                onDelete();
            }
        } catch (error) {
            console.error('Error deleting schedule item:', error);
        }
    };

    const formatTime = (time) => {
        if (!time) return null;
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getCategoryEmoji = (category) => {
        const emojis = {
            meals: '🍽️',
            transport: '🚗',
            accommodation: '🏨',
            activities: '🎯',
            meetings: '👥',
            other: '📝'
        };
        return emojis[category] || '📝';
    };

    return (
        <div className="tab-list-item">
            <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 24
            }}>
                {getCategoryEmoji(item.category)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Time */}
                {(item.start_time || item.end_time) && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        marginBottom: 2, fontSize: 12,
                        fontWeight: 600, color: 'var(--primary)',
                        letterSpacing: '0.05em', textTransform: 'uppercase'
                    }}>
                        <Clock size={12} />
                        {formatTime(item.start_time)}
                        {item.end_time && ` - ${formatTime(item.end_time)}`}
                    </div>
                )}

                {/* Title */}
                <h4 style={{
                    fontSize: 16, fontWeight: 600,
                    color: 'var(--text-primary)', marginBottom: 4
                }}>
                    {item.title}
                </h4>

                {/* Description */}
                {item.description && (
                    <p style={{
                        fontSize: 13, color: 'var(--text-secondary)',
                        marginBottom: 8, lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {item.description}
                    </p>
                )}

                {/* Meta Info */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 12,
                    fontSize: 12, color: 'var(--text-secondary)'
                }}>
                    {item.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} />
                            {item.location}
                        </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 500 }}>
                        <DollarSign size={12} />
                        {formatCurrency(item.estimated_cost, event?.country)}
                    </span>
                </div>
            </div>

            <div className="item-actions">
                <button onClick={handleDelete} className="action-btn delete-btn">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default ScheduleItemCard;


