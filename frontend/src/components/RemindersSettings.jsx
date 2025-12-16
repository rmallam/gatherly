import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Plus, Trash2, Check, X, Calendar } from 'lucide-react';

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

    const handleCreateReminder = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/reminders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
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
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reminders...</div>;
    }

    const sentCount = reminders.filter(r => r.sent).length;
    const pendingCount = reminders.filter(r => !r.sent).length;

    return (
        <div>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Reminders</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {reminders.length}
                    </div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Sent</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
                        {sentCount}
                    </div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Pending</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>
                        {pendingCount}
                    </div>
                </div>
            </div>

            {/* Auto-Schedule Section */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Smart Reminders</h3>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Automatically schedule reminders for your event</p>
                    </div>
                    <Bell size={32} style={{ opacity: 0.9 }} />
                </div>

                <button
                    onClick={handleAutoSchedule}
                    className="btn btn-primary"
                    style={{ width: '100%', background: 'white', color: 'var(--primary)', marginBottom: '1rem' }}
                >
                    <Calendar size={18} /> Auto-Schedule Reminders
                </button>

                <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'grid', gap: '0.25rem' }}>
                    <p>• RSVP Follow-up: 7 days before event</p>
                    <p>• Day Before: 24 hours before event</p>
                    <p>• Event Starting: 2 hours before event</p>
                </div>
            </div>

            {/* Scheduled Reminders */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Scheduled Reminders ({reminders.length})</h4>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        <Plus size={16} /> Add Custom
                    </button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--primary)' }}>
                        <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create Custom Reminder</h5>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Type</label>
                                <select
                                    value={form.reminder_type}
                                    onChange={(e) => setForm({ ...form, reminder_type: e.target.value })}
                                    className="form-input"
                                >
                                    {REMINDER_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Recipients</label>
                                <select
                                    value={form.recipient_type}
                                    onChange={(e) => setForm({ ...form, recipient_type: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="guests">All Guests</option>
                                    <option value="host">Event Host (Me)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Send Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={form.send_at}
                                    onChange={(e) => setForm({ ...form, send_at: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Message</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Enter reminder message..."
                                    className="form-input"
                                    rows="3"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleCreateReminder} className="btn btn-primary" style={{ flex: 1 }}>
                                    <Check size={16} /> Create
                                </button>
                                <button onClick={() => setShowForm(false)} className="btn btn-secondary">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reminders List */}
                {reminders.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <Bell size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Reminders Scheduled</h4>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Set up smart reminders to notify guests about your event
                        </p>
                        <button onClick={handleAutoSchedule} className="btn btn-primary">
                            <Calendar size={18} /> Auto-Schedule Now
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {reminders.map((reminder) => (
                            <div key={reminder.id} className="card" style={{ padding: '1rem', background: reminder.sent ? 'var(--bg-secondary)' : 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Bell size={16} style={{ color: 'var(--primary)' }} />
                                            <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                                {reminder.reminder_type.replace('_', ' ')}
                                            </span>
                                            {reminder.sent && (
                                                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                                                    Sent
                                                </span>
                                            )}
                                            {!reminder.sent && (
                                                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--warning)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            {reminder.message}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            {formatDate(reminder.send_at)} • {reminder.recipient_type}
                                        </p>
                                    </div>
                                    {!reminder.sent && (
                                        <button
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}</div>
                )}
            </div>
        </div>
    );
};

export default RemindersSettings;
