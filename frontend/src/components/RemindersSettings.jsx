import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Plus, Trash2, Check, X, Calendar, Clock, MessageSquare, User } from 'lucide-react';
import '../pages/EventTabs.css';

const REMINDER_TYPES = [
    { value: 'rsvp_followup', label: 'RSVP Follow-up' },
    { value: 'event_tomorrow', label: 'Day Before Event' },
    { value: 'event_starting', label: 'Event Starting Soon' },
    { value: 'custom', label: 'Custom Reminder' }
];

const RemindersSettings = ({ event }) => {
    const { API_URL } = useApp();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        reminder_type: 'custom',
        recipient_type: 'guests',
        send_at: '',
        message: ''
    });

    useEffect(() => {
        if (event?.id) {
            fetchReminders();
        }
    }, [event?.id]);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/reminders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setReminders(data);
            }
        } catch (error) {
            console.error('Error fetching reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/reminders/auto-schedule`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchReminders();
                alert('Smart reminders scheduled successfully!');
            }
        } catch (error) {
            console.error('Error scheduling reminders:', error);
        }
    };

    const handleCreateReminder = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Convert local datetime to UTC ISO string
            const sendAtUTC = new Date(form.send_at).toISOString();

            const response = await fetch(`${API_URL}/events/${event.id}/reminders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    send_at: sendAtUTC
                })
            });

            if (response.ok) {
                setShowForm(false);
                setForm({
                    reminder_type: 'custom',
                    recipient_type: 'guests',
                    send_at: '',
                    message: ''
                });
                fetchReminders();
            }
        } catch (error) {
            console.error('Error creating reminder:', error);
        }
    };

    const handleDeleteReminder = async (reminderId) => {
        if (!confirm('Delete this reminder?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/events/${event.id}/reminders/${reminderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchReminders();
        } catch (error) {
            console.error('Error deleting reminder:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="tab-empty-state">Loading reminders...</div>;
    }

    const sentCount = reminders.filter(r => r.sent).length;
    const pendingCount = reminders.filter(r => !r.sent).length;

    return (
        <div className="event-tab-page">
            {/* Stats Cards */}
            <div className="tab-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stats-card">
                    <div className="label">Total</div>
                    <div className="value">{reminders.length}</div>
                </div>
                <div className="stats-card">
                    <div className="label">Sent</div>
                    <div className="value" style={{ color: 'var(--success)' }}>{sentCount}</div>
                </div>
                <div className="stats-card">
                    <div className="label">Pending</div>
                    <div className="value" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
                </div>
            </div>

            {/* Auto-Schedule Section */}
            <div className="hero-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="hero-content">
                    <div className="hero-icon">
                        <Bell size={24} color="white" />
                    </div>
                    <div className="hero-text">
                        <h3>Smart Reminders</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                            Automatically schedule reminders for your event (RSVP check, Day before, etc.)
                        </p>
                    </div>
                    <button
                        onClick={handleAutoSchedule}
                        className="btn-primary"
                        style={{ background: 'white', color: '#764ba2', border: 'none' }}
                    >
                        <Calendar size={18} /> Auto-Schedule
                    </button>
                </div>
            </div>

            {/* Scheduled Reminders */}
            <div className="section-header">
                <h3 className="section-title">Scheduled Reminders</h3>
                <span className="category-pill">{reminders.length}</span>
            </div>

            {reminders.length === 0 ? (
                <div className="tab-empty-state">
                    <Bell size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <h4>No Reminders Scheduled</h4>
                    <p>Set up smart reminders to notify guests about your event</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: 16 }}>
                        <Plus size={18} /> Add Reminder
                    </button>
                </div>
            ) : (
                <div className="tab-list">
                    {reminders.map((reminder) => (
                        <div key={reminder.id} className="tab-list-item">
                            <div className="icon-box" style={{ background: reminder.sent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                                <Bell size={20} color={reminder.sent ? '#10b981' : '#f59e0b'} />
                            </div>
                            <div className="info">
                                <h4>{reminder.reminder_type.replace('_', ' ')}</h4>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                    {reminder.message}
                                </p>
                                <div className="meta-row">
                                    <span className="meta-item">
                                        <Clock size={12} /> {formatDate(reminder.send_at)}
                                    </span>
                                    <span className="meta-item">
                                        <User size={12} /> {reminder.recipient_type}
                                    </span>
                                    {reminder.sent ? (
                                        <span className="meta-item" style={{ color: 'var(--success)', fontWeight: 600 }}>Sent</span>
                                    ) : (
                                        <span className="meta-item" style={{ color: 'var(--warning)', fontWeight: 600 }}>Pending</span>
                                    )}
                                </div>
                            </div>
                            {!reminder.sent && (
                                <div className="item-actions">
                                    <button onClick={() => handleDeleteReminder(reminder.id)} className="action-btn delete-btn">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Action Button */}
            <button className="btn-floating-action" onClick={() => setShowForm(true)}>
                <Plus size={24} />
            </button>

            {/* Create Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="section-header">
                            <h3 className="section-title">Create Custom Reminder</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReminder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Type</label>
                                <select
                                    value={form.reminder_type}
                                    onChange={(e) => setForm({ ...form, reminder_type: e.target.value })}
                                    className="modern-input"
                                >
                                    {REMINDER_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Recipients</label>
                                <select
                                    value={form.recipient_type}
                                    onChange={(e) => setForm({ ...form, recipient_type: e.target.value })}
                                    className="modern-input"
                                >
                                    <option value="guests">All Guests</option>
                                    <option value="host">Event Host (Me)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Send Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={form.send_at}
                                    onChange={(e) => setForm({ ...form, send_at: e.target.value })}
                                    className="modern-input"
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Message</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Enter reminder message..."
                                    className="modern-input"
                                    rows="3"
                                    style={{ minHeight: 80, resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
                                <Check size={18} /> Create Reminder
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemindersSettings;
