import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import { Send, MessageSquare, Heart, History, Loader, Users, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../pages/EventTabs.css';

const MessagesTab = ({ event }) => {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('announcement');
    const [message, setMessage] = useState('');
    const [recipientFilter, setRecipientFilter] = useState('all');
    const [senderName, setSenderName] = useState(user?.name || 'Your Event Team');
    const [sending, setSending] = useState(false);
    const [communications, setCommunications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch communication history
    useEffect(() => {
        fetchCommunications();
    }, [event.id]);

    const fetchCommunications = async () => {
        try {
            const response = await fetch(`${API_URL}/events/${event.id}/communications`, {
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
            const response = await fetch(`${API_URL}/events/${event.id}/communications/announcement`, {
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
            const response = await fetch(`${API_URL}/events/${event.id}/communications/thank-you`, {
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
        <div className="event-tab-page">
            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
                <button
                    onClick={() => setActiveTab('announcement')}
                    className={`btn-secondary ${activeTab === 'announcement' ? 'active-tab-btn' : ''}`}
                    style={{
                        background: activeTab === 'announcement' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'announcement' ? 'white' : 'var(--text-secondary)',
                        border: activeTab === 'announcement' ? 'none' : '1px solid var(--border)',
                        padding: '8px 16px',
                        borderRadius: 20
                    }}
                >
                    <MessageSquare size={16} /> Announcement
                </button>
                <button
                    onClick={() => setActiveTab('thankyou')}
                    className={`btn-secondary ${activeTab === 'thankyou' ? 'active-tab-btn' : ''}`}
                    style={{
                        background: activeTab === 'thankyou' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'thankyou' ? 'white' : 'var(--text-secondary)',
                        border: activeTab === 'thankyou' ? 'none' : '1px solid var(--border)',
                        padding: '8px 16px',
                        borderRadius: 20
                    }}
                >
                    <Heart size={16} /> Thank You
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`btn-secondary ${activeTab === 'history' ? 'active-tab-btn' : ''}`}
                    style={{
                        background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
                        border: activeTab === 'history' ? 'none' : '1px solid var(--border)',
                        padding: '8px 16px',
                        borderRadius: 20
                    }}
                >
                    <History size={16} /> History
                </button>
            </div>

            {/* Announcement Tab */}
            {activeTab === 'announcement' && (
                <div className="hero-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div className="section-header">
                        <h3 className="section-title">Send Announcement</h3>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your announcement here..."
                            className="modern-input"
                            style={{ minHeight: 120, resize: 'vertical' }}
                            maxLength={320}
                        />
                        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                            {message.length}/320 characters
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Sender Name
                        </label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Your name or organization"
                            className="modern-input"
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Send to
                        </label>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="recipient"
                                    value="all"
                                    checked={recipientFilter === 'all'}
                                    onChange={(e) => setRecipientFilter(e.target.value)}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: 14 }}>All Guests</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="recipient"
                                    value="confirmed"
                                    checked={recipientFilter === 'confirmed'}
                                    onChange={(e) => setRecipientFilter(e.target.value)}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: 14 }}>Confirmed Only</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="recipient"
                                    value="attended"
                                    checked={recipientFilter === 'attended'}
                                    onChange={(e) => setRecipientFilter(e.target.value)}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: 14 }}>Attended Only</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ padding: 12, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--primary)' }}>
                            <Users size={16} />
                            <span>Will send to <strong>{getRecipientCount()}</strong> guests</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSendAnnouncement}
                        disabled={sending || !message.trim()}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {sending ? (
                            <><Loader size={18} className="animate-spin" /> Sending...</>
                        ) : (
                            <><Send size={18} /> Send Announcement</>
                        )}
                    </button>
                </div>
            )}

            {/* Thank You Tab */}
            {activeTab === 'thankyou' && (
                <div className="hero-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div className="section-header">
                        <h3 className="section-title">Send Thank You Messages</h3>
                    </div>

                    <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, marginBottom: 24 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.5 }}>
                            Send personalized thank you messages to all guests who attended your event. This will send a pre-formatted heartwarming message.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--success)' }}>
                            <Users size={16} />
                            <span>Will send to <strong>{event.guests?.filter(g => g.attended === true).length || 0}</strong> attended guests</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSendThankYou}
                        disabled={sending || (event.guests?.filter(g => g.attended === true).length || 0) === 0}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', background: 'var(--success)' }}
                    >
                        {sending ? (
                            <><Loader size={18} className="animate-spin" /> Sending...</>
                        ) : (
                            <><Heart size={18} /> Send Thank You Messages</>
                        )}
                    </button>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div>
                    <div className="section-header">
                        <h3 className="section-title">Message History</h3>
                    </div>

                    {loading ? (
                        <div className="tab-empty-state">
                            <Loader size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                            Loading...
                        </div>
                    ) : communications.length === 0 ? (
                        <div className="tab-empty-state">
                            <History size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                            <h4>No messages sent yet</h4>
                            <p>Announcements and Thank You notes you send will appear here.</p>
                        </div>
                    ) : (
                        <div className="tab-list">
                            {communications.map((comm) => (
                                <div key={comm.id} className="tab-list-item">
                                    <div className="icon-box" style={{ background: comm.type === 'announcement' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                                        {comm.type === 'announcement' ?
                                            <MessageSquare size={20} color="var(--primary)" /> :
                                            <Heart size={20} color="var(--success)" />
                                        }
                                    </div>
                                    <div className="info">
                                        <h4>{comm.type === 'announcement' ? 'Announcement' : 'Thank You Message'}</h4>
                                        {comm.type === 'announcement' && (
                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {comm.message}
                                            </p>
                                        )}
                                        <div className="meta-row">
                                            <span className="meta-item">
                                                <History size={12} /> {formatDate(comm.created_at)}
                                            </span>
                                            <span className="meta-item">
                                                <CheckCircle size={12} color="var(--success)" /> {comm.sent_count} sent
                                            </span>
                                            {comm.failed_count > 0 && (
                                                <span className="meta-item" style={{ color: 'var(--error)' }}>
                                                    <XCircle size={12} /> {comm.failed_count} failed
                                                </span>
                                            )}
                                            <span className="meta-item">
                                                To: {comm.recipient_filter}
                                            </span>
                                        </div>
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
