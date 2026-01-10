import React, { useState } from 'react';
import API_URL from '../../config/api';
import { X, Calendar, Clock, MapPin, DollarSign, Type } from 'lucide-react';
import '../../pages/EventTabs.css';

const AddScheduleItemModal = ({ event, selectedDate, onClose, onItemAdded }) => {
    const [formData, setFormData] = useState({
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        location: '',
        category: 'activities',
        estimatedCost: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const categories = [
        { value: 'meals', label: '🍽️ Meals', emoji: '🍽️' },
        { value: 'transport', label: '🚗 Transport', emoji: '🚗' },
        { value: 'accommodation', label: '🏨 Accommodation', emoji: '🏨' },
        { value: 'activities', label: '🎯 Activities', emoji: '🎯' },
        { value: 'meetings', label: '👥 Meetings', emoji: '👥' },
        { value: 'other', label: '📝 Other', emoji: '📝' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.date) {
            setError('Title and date are required');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: formData.date,
                    startTime: formData.startTime || null,
                    endTime: formData.endTime || null,
                    title: formData.title,
                    description: formData.description || null,
                    location: formData.location || null,
                    category: formData.category,
                    estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null
                })
            });

            if (response.ok) {
                onItemAdded();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create activity');
            }
        } catch (error) {
            console.error('Error creating schedule item:', error);
            setError('Failed to create activity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="section-header">
                    <h3 className="section-title">Add Activity</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {error && (
                        <div style={{
                            padding: 12, borderRadius: 8,
                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                            fontSize: 13
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Date *</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                            <input
                                type="date"
                                className="modern-input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                    </div>

                    {/* Time Range */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Start Time</label>
                            <div style={{ position: 'relative' }}>
                                <Clock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                                <input
                                    type="time"
                                    className="modern-input"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>End Time</label>
                            <div style={{ position: 'relative' }}>
                                <Clock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                                <input
                                    type="time"
                                    className="modern-input"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Title *</label>
                        <div style={{ position: 'relative' }}>
                            <Type size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                className="modern-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Temple Tour, Breakfast"
                                required
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Category</label>
                        <select
                            className="modern-input"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Description</label>
                        <textarea
                            className="modern-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details about this activity..."
                            rows={3}
                            style={{ minHeight: 80, resize: 'vertical' }}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Location</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                className="modern-input"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Tanah Lot Temple"
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                    </div>

                    {/* Estimated Cost */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Estimated Cost ($)</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                            <input
                                type="number"
                                className="modern-input"
                                value={formData.estimatedCost}
                                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: 8, justifyContent: 'center' }}
                    >
                        {loading ? 'Adding...' : 'Add Activity'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddScheduleItemModal;
