import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Trash2, Check, X, Calendar, Clock, MessageSquare, User, Sparkles } from 'lucide-react';
import { useBackButton } from '../hooks/useBackButton';
import '../pages/EventTabs.css';

const REMINDER_TYPES = [
    { value: 'rsvp_followup', label: 'RSVP Follow-up' },
    { value: 'event_tomorrow', label: 'Day Before Event' },
    { value: 'event_starting', label: 'Event Starting Soon' },
    { value: 'custom', label: 'Custom Reminder' }
];

const RemindersSettings = ({ event }) => {
    const { API_URL } = useApp();
    const { user } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAIReminders, setShowAIReminders] = useState(false);
    const [form, setForm] = useState({
        reminder_type: 'custom',
        recipient_type: 'guests',
        send_at: '',
        message: ''
    });

    useBackButton(() => setShowForm(false), showForm);

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
            <div className="tab-stats-grid">
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Bell size={14} color="var(--primary)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{reminders.length}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Check size={14} color="#10b981" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sent</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{sentCount}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Clock size={14} color="#f59e0b" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{pendingCount}</span>
                </div>
            </div>

            {/* Action Buttons Row */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                >
                    <Plus size={16} /> Add Custom Reminder
                </button>
                <button
                    onClick={() => setShowAIReminders(!showAIReminders)}
                    className="btn btn-secondary"
                    style={{
                        flex: 1,
                        background: showAIReminders ? 'var(--bg-secondary)' : 'transparent',
                        borderColor: showAIReminders ? 'var(--primary)' : 'var(--border-color)',
                        color: showAIReminders ? 'var(--primary)' : 'var(--text-primary)'
                    }}
                >
                    <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                    {showAIReminders ? 'Hide Auto-Schedule' : 'Smart Auto-Schedule'}
                </button>
            </div>

            {/* AI Auto-Schedule Card (Pro only) */}
            {showAIReminders && user?.subscription_tier === 'pro' && (
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '16px', padding: '24px', marginBottom: '24px',
                    border: '1px solid var(--border-color)', textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Sparkles size={20} color="var(--primary)" /> Smart Auto-Schedule
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Let AI automatically generate and schedule reminders for RSVP checks, day before, and event day based on your event details.
                    </p>
                    <button onClick={handleAutoSchedule} className="btn btn-primary" style={{ margin: '0 auto' }}>
                        <Sparkles size={16} /> Generate & Schedule
                    </button>
                </div>
            )}

            {/* Upgrade Card (Free only) */}
            {showAIReminders && (!user?.subscription_tier || user?.subscription_tier === 'free') && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    border: '2px dashed rgba(99, 102, 241, 0.3)'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <Sparkles size={32} color="var(--primary)" />
                    </div>
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '8px'
                    }}>
                        Smart Auto-Schedule
                    </h3>
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '20px',
                        fontSize: '15px'
                    }}>
                        Automatically generate and schedule reminders for RSVP checks, day before, and event day.
                    </p>
                    <a
                        href="/pro"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                            color: 'white',
                            padding: '14px 28px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '16px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        <Sparkles size={18} />
                        Upgrade to Pro
                    </a>
                </div>
            )}

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
                    <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginTop: 16 }}>
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

                            <button type="submit" className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
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
