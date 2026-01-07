import React from 'react';
import API_URL from '../../config/api';
import { Trash2, MapPin, DollarSign, Users, Clock } from 'lucide-react';

const ScheduleItemCard = ({ item, eventId, onUpdate, onDelete }) => {

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events/${eventId}/schedule/${item.id}`, {
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

    const getCategoryGradient = (category) => {
        const gradients = {
            meals: 'linear-gradient(135deg, #667eea, #764ba2)',
            transport: 'linear-gradient(135deg, #f093fb, #f5576c)',
            accommodation: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            activities: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            meetings: 'linear-gradient(135deg, #fa709a, #fee140)',
            other: 'linear-gradient(135deg, #a8edea, #fed6e3)'
        };
        return gradients[category] || gradients.other;
    };

    return (
        <div
            className="card"
            style={{
                padding: '1.5rem',
                position: 'relative'
            }}
        >
            {/* Delete Button */}
            <button
                onClick={handleDelete}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
            >
                <Trash2 size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                {/* Category Icon */}
                <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: 'var(--radius-lg)',
                    background: getCategoryGradient(item.category),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <span style={{ fontSize: '1.75rem' }}>{getCategoryEmoji(item.category)}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '2rem' }}>
                    {/* Time */}
                    {(item.start_time || item.end_time) && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--primary)'
                        }}>
                            <Clock size={14} />
                            {formatTime(item.start_time)}
                            {item.end_time && ` - ${formatTime(item.end_time)}`}
                        </div>
                    )}

                    {/* Title */}
                    <h4 style={{
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        {item.title}
                    </h4>

                    {/* Description */}
                    {item.description && (
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.75rem',
                            lineHeight: '1.5'
                        }}>
                            {item.description}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {item.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <MapPin size={14} />
                                {item.location}
                            </span>
                        )}
                        {item.estimated_cost && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <DollarSign size={14} />
                                ${parseFloat(item.estimated_cost).toFixed(2)}
                            </span>
                        )}
                        {item.assigned_to && item.assigned_to.length > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Users size={14} />
                                {item.assigned_to.length} assigned
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleItemCard;
