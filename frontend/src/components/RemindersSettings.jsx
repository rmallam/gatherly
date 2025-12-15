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
    const { API_URL, token } = useApp();
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
        return <div className="text-center py-8">Loading reminders...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Auto-Schedule Section */}
            <div className="card p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Smart Reminders</h3>
                        <p className="text-sm text-gray-600 mt-1">Automatically schedule reminders for your event</p>
                    </div>
                    <Bell className="text-purple-600" size={32} />
                </div>

                <button onClick={handleAutoSchedule} className="btn btn-primary w-full">
                    <Calendar size={18} /> Auto-Schedule Reminders
                </button>

                <div className="mt-4 text-xs text-gray-500">
                    <p>• RSVP Follow-up: 7 days before event</p>
                    <p>• Day Before: 24 hours before event</p>
                    <p>• Event Starting: 2 hours before event</p>
                </div>
            </div>

            {/* Scheduled Reminders */}
            <div className="card p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Scheduled Reminders ({reminders.length})</h4>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-secondary btn-sm">
                        <Plus size={16} /> Add Custom
                    </button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-semibold mb-3">Create Custom Reminder</h5>
                        <div className="space-y-3">
                            <select
                                value={form.reminder_type}
                                onChange={(e) => setForm({ ...form, reminder_type: e.target.value })}
                                className="form-input"
                            >
                                {REMINDER_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>

                            <select
                                value={form.recipient_type}
                                onChange={(e) => setForm({ ...form, recipient_type: e.target.value })}
                                className="form-input"
                            >
                                <option value="guests">All Guests</option>
                                <option value="host">Event Host (Me)</option>
                            </select>

                            <input
                                type="datetime-local"
                                value={form.send_at}
                                onChange={(e) => setForm({ ...form, send_at: e.target.value })}
                                className="form-input"
                            />

                            <textarea
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Reminder message..."
                                className="form-input"
                                rows="3"
                            />

                            <div className="flex gap-2">
                                <button onClick={handleCreateReminder} className="btn btn-primary flex-1">
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
                    <p className="text-gray-500 text-center py-8">No reminders scheduled</p>
                ) : (
                    <div className="space-y-2">
                        {reminders.map((reminder) => (
                            <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Bell size={16} className="text-purple-600" />
                                        <span className="font-medium capitalize">{reminder.reminder_type.replace('_', ' ')}</span>
                                        {reminder.sent && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Sent</span>}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{reminder.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDate(reminder.send_at)} • {reminder.recipient_type}
                                    </p>
                                </div>
                                {!reminder.sent && (
                                    <button
                                        onClick={() => handleDeleteReminder(reminder.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="card p-4 bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Reminders will be sent automatically at the scheduled time. Make sure your event has a valid date set.
                </p>
            </div>
        </div>
    );
};

export default RemindersSettings;
