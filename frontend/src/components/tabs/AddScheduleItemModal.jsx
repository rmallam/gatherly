import React, { useState } from 'react';
import { X } from 'lucide-react';

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

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
            const response = await fetch(`${API_URL}/api/events/${event.id}/schedule`, {
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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="card" style={{
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Add Activity
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                }}>
                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Date *
                        </label>
                        <input
                            type="date"
                            className="input"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    {/* Time Range */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Start Time
                            </label>
                            <input
                                type="time"
                                className="input"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                End Time
                            </label>
                            <input
                                type="time"
                                className="input"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Temple Tour, Breakfast, Check-in"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Category
                        </label>
                        <select
                            className="input"
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
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Description
                        </label>
                        <textarea
                            className="input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details about this activity..."
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Location
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., Tanah Lot Temple, Hotel Restaurant"
                        />
                    </div>

                    {/* Estimated Cost */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Estimated Cost (per person)
                        </label>
                        <input
                            type="number"
                            className="input"
                            value={formData.estimatedCost}
                            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? 'Adding...' : 'Add Activity'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddScheduleItemModal;
