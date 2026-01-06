import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Heart, History, Loader, Users, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MessagesTab = ({ event }) => {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('announcement');
    const [message, setMessage] = useState('');
    const [recipientFilter, setRecipientFilter] = useState('all');
    const [senderName, setSenderName] = useState(user?.name || 'Your Event Team');
    const [sending, setSending] = useState(false);
    const [communications, setCommunications] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'https://gatherly-backend-3vmv.onrender.com';


    // Fetch communication history
    useEffect(() => {
        fetchCommunications();
    }, [event.id]);

    const fetchCommunications = async () => {
        try {
            const response = await fetch(`${API_URL}/api/events/${event.id}/communications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCommunications(data);
            }
        } catch (error) {
            console.error('Error fetching communications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRecipientCount = () => {
        if (!event.guests) return 0;
        if (recipientFilter === 'all') return event.guests.length;
        if (recipientFilter === 'confirmed') return event.guests.filter(g => g.rsvp === true).length;
        if (recipientFilter === 'attended') return event.guests.filter(g => g.attended === true).length;
        return 0;
    };

    const handleSendAnnouncement = async () => {
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        if (message.length > 320) {
            alert('Message must be 320 characters or less');
            return;
        }

        const recipientCount = getRecipientCount();
        if (recipientCount === 0) {
            alert('No guests match the selected filter');
            return;
        }

        if (!confirm(`Send announcement to ${recipientCount} guests?`)) {
            return;
        }

        setSending(true);
        try {
            const response = await fetch(`${API_URL}/api/events/${event.id}/communications/announcement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message, recipientFilter, senderName })
            });

            if (response.ok) {
                alert('Announcement sent successfully!');
                setMessage('');
                fetchCommunications();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to send announcement');
            }
        } catch (error) {
            console.error('Error sending announcement:', error);
            alert('Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    const handleSendThankYou = async () => {
        const attendedCount = event.guests?.filter(g => g.attended === true).length || 0;

        if (attendedCount === 0) {
            alert('No guests have attended this event yet');
            return;
        }

        if (!confirm(`Send thank you messages to ${attendedCount} guests who attended?`)) {
            return;
        }

        setSending(true);
        try {
            const response = await fetch(`${API_URL}/api/events/${event.id}/communications/thank-you`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ senderName })
            });

            if (response.ok) {
                alert('Thank you messages sent successfully!');
                fetchCommunications();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to send thank you messages');
            }
        } catch (error) {
            console.error('Error sending thank you:', error);
            alert('Failed to send thank you messages');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('announcement')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === 'announcement' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'announcement' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <MessageSquare size={16} /> Announcement
                </button>
                <button
                    onClick={() => setActiveTab('thankyou')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === 'thankyou' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'thankyou' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Heart size={16} /> Thank You
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <History size={16} /> History
                </button>
            </div>

            {/* Announcement Tab */}
            {activeTab === 'announcement' && (
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Send Announcement
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your announcement here..."
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '0.75rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            maxLength={320}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                            {message.length}/320 characters
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Sender Name
                        </label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Your name or organization"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Send to
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="recipient"
                                    value="all"
                                    checked={recipientFilter === 'all'}
                                    onChange={(e) => setRecipientFilter(e.target.value)}
                                />
                                <span style={{ fontSize: '0.875rem' }}>All Guests</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="recipient"
                                    value="confirmed"
                                    checked={recipientFilter === 'confirmed'}
                                    onChange={(e) => setRecipientFilter(e.target.value)}
                                />
                                <span style={{ fontSize: '0.875rem' }}>Confirmed Only</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="recipient"
                                    value="attended"
                                    checked={recipientFilter === 'attended'}
                                    onChange={(e) => setRecipientFilter(e.target.value)}
                                />
                                <span style={{ fontSize: '0.875rem' }}>Attended Only</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                            <Users size={16} />
                            <span>Will send to <strong style={{ color: 'var(--primary)' }}>{getRecipientCount()}</strong> guests</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSendAnnouncement}
                        disabled={sending || !message.trim()}
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {sending ? (
                            <><Loader size={16} className="animate-spin" /> Sending...</>
                        ) : (
                            <><Send size={16} /> Send Announcement</>
                        )}
                    </button>
                </div>
            )}

            {/* Thank You Tab */}
            {activeTab === 'thankyou' && (
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Send Thank You Messages
                    </h3>

                    <div style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            Send personalized thank you messages to all guests who attended your event.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                            <Users size={16} />
                            <span>Will send to <strong style={{ color: 'var(--primary)' }}>{event.guests?.filter(g => g.attended === true).length || 0}</strong> attended guests</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSendThankYou}
                        disabled={sending || (event.guests?.filter(g => g.attended === true).length || 0) === 0}
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {sending ? (
                            <><Loader size={16} className="animate-spin" /> Sending...</>
                        ) : (
                            <><Heart size={16} /> Send Thank You Messages</>
                        )}
                    </button>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Message History
                    </h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            <Loader size={24} className="animate-spin" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '0.5rem' }}>Loading...</p>
                        </div>
                    ) : communications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            <History size={48} style={{ margin: '0 auto', opacity: 0.3 }} />
                            <p style={{ marginTop: '1rem' }}>No messages sent yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {communications.map((comm) => (
                                <div
                                    key={comm.id}
                                    style={{
                                        padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: `4px solid ${comm.type === 'announcement' ? 'var(--primary)' : '#10b981'}`
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {comm.type === 'announcement' ? <MessageSquare size={16} /> : <Heart size={16} />}
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {comm.type === 'announcement' ? 'Announcement' : 'Thank You'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            {formatDate(comm.created_at)}
                                        </span>
                                    </div>
                                    {comm.type === 'announcement' && (
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            {comm.message}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <CheckCircle size={12} style={{ color: '#10b981' }} />
                                            {comm.sent_count} sent
                                        </span>
                                        {comm.failed_count > 0 && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <XCircle size={12} style={{ color: '#ef4444' }} />
                                                {comm.failed_count} failed
                                            </span>
                                        )}
                                        <span>• {comm.recipient_filter}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessagesTab;
