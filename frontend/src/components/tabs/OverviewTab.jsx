import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle, X, DollarSign, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import '../../pages/EventTabs.css';

const OverviewTab = ({ event, onTabChange }) => {
    const { API_URL } = useApp();
    const navigate = useNavigate();
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalGuests, setModalGuests] = useState([]);

    // Shared Event Data State
    const [sharedData, setSharedData] = useState({
        totalPotentialBudget: 0,
        totalExpenses: 0,
        nextScheduleItem: null,
        recentExpenses: [],
        loading: true
    });

    if (!event) return null;

    const isSharedEvent = event.event_type === 'shared';

    // Shared Event Overview (Trip-focused)
    if (isSharedEvent) {
        useEffect(() => {
            const fetchSharedData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Authorization': `Bearer ${token}` };

                    // 1. Fetch Expenses (Budget)
                    const expensesRes = await fetch(`${API_URL}/events/${event.id}/expenses`, { headers });
                    const expensesData = await expensesRes.json();

                    let totalExpenses = 0;
                    let recentExpenses = [];
                    if (expensesRes.ok) {
                        const expenses = expensesData.expenses || [];
                        totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
                        recentExpenses = expenses.slice(0, 3);
                    }

                    // 2. Fetch Schedule
                    const scheduleRes = await fetch(`${API_URL}/events/${event.id}/schedule`, { headers });
                    const scheduleData = await scheduleRes.json();

                    let nextItem = null;
                    if (scheduleRes.ok) {
                        const items = scheduleData.scheduleItems || [];
                        const now = new Date();
                        nextItem = items
                            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                            .find(item => new Date(item.start_time) > now);
                    }

                    setSharedData({
                        totalExpenses,
                        nextScheduleItem: nextItem,
                        recentExpenses,
                        loading: false
                    });

                } catch (err) {
                    console.error("Failed to fetch shared event data", err);
                    setSharedData(prev => ({ ...prev, loading: false }));
                }
            };

            fetchSharedData();
        }, [event.id]);

        const totalParticipants = (event.guests?.length || 0) + 1; // +1 for organizer
        const eventDate = event.date ? new Date(event.date) : null;
        const today = new Date();
        const daysUntil = eventDate ? Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24)) : null;

        // Calculate trip duration
        let tripDuration = 1;
        if (event.end_date && event.date) {
            const start = new Date(event.date);
            const end = new Date(event.end_date);
            tripDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }

        const sharedQuickActions = [
            { label: 'Add Expense', icon: <DollarSign size={20} />, onClick: () => onTabChange && onTabChange('expenses'), color: '#10b981' }, // Green
            { label: 'Schedule', icon: <Calendar size={20} />, onClick: () => onTabChange && onTabChange('schedule'), color: '#f59e0b' }, // Amber
            { label: 'Messages', icon: <Users size={20} />, onClick: () => onTabChange && onTabChange('messages'), color: '#3b82f6' }, // Blue
        ];

        return (
            <div className="event-tab-page">
                {/* Hero Section */}
                <div className="hero-card hero-card-trip">
                    <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 12, backdropFilter: 'blur(4px)' }}>
                            <Calendar size={12} />
                            {daysUntil !== null ? (daysUntil > 0 ? `${daysUntil} Days Away` : daysUntil === 0 ? 'Trip starts today!' : 'Trip Completed') : 'No Date Set'}
                        </div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{event.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, opacity: 0.9 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={14} />
                                {event.location || 'Location TBD'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={14} />
                                {tripDuration} Day Trip
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Row */}
                <div className="tab-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                    {sharedQuickActions.map((action, index) => (
                        <div key={index} className="stats-card" onClick={action.onClick} style={{ cursor: 'pointer', padding: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${action.color}20`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                {action.icon}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</span>
                        </div>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="tab-stats-grid">
                    <div className="stats-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <DollarSign size={14} color="#10b981" />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Spent</span>
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>${sharedData.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="stats-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Users size={14} color="#6366f1" />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Group Size</span>
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{totalParticipants}</span>
                    </div>
                </div>

                {/* Insights Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Up Next */}
                    <div>
                        <div className="section-header">
                            <h3 className="section-title">Up Next</h3>
                            <button onClick={() => onTabChange && onTabChange('schedule')} className="tab-action-btn" style={{ fontSize: 13, color: 'var(--primary)', padding: 0, background: 'none' }}>View Schedule</button>
                        </div>
                        {sharedData.nextScheduleItem ? (
                            <div className="tab-list-item" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
                                        {new Date(sharedData.nextScheduleItem.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{sharedData.nextScheduleItem.title}</div>
                                    {sharedData.nextScheduleItem.location && <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><MapPin size={12} /> {sharedData.nextScheduleItem.location}</div>}
                                </div>
                            </div>
                        ) : (
                            <div className="tab-empty-state" style={{ padding: 20 }}>No upcoming activities</div>
                        )}
                    </div>

                    {/* Recent Expenses */}
                    <div>
                        <div className="section-header">
                            <h3 className="section-title">Recent Activity</h3>
                            <button onClick={() => onTabChange && onTabChange('expenses')} className="tab-action-btn" style={{ fontSize: 13, color: 'var(--primary)', padding: 0, background: 'none' }}>View All</button>
                        </div>
                        <div className="tab-list">
                            {sharedData.recentExpenses.length > 0 ? (
                                sharedData.recentExpenses.map((exp, i) => (
                                    <div key={i} className="tab-list-item">
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={18} /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{exp.description}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{exp.category} • {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${parseFloat(exp.amount).toFixed(2)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="tab-empty-state" style={{ padding: 20 }}>No expenses added yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Host Event Overview (Guest-focused)
    const totalGuests = event.guests?.length || 0;
    const confirmedGuests = event.guests?.filter(g => g.rsvp === true) || [];
    const checkedInGuests = event.guests?.filter(g => g.attended) || [];
    const pendingRSVP = event.guests?.filter(g => g.rsvp === null || g.rsvp === undefined).length || 0;
    const declinedRSVP = event.guests?.filter(g => g.rsvp === false).length || 0;

    // Task Stats
    const totalTasks = event.tasks?.length || 0;
    const pendingTasks = event.tasks?.filter(t => t.status === 'pending') || [];

    // Countdown
    const eventDate = event.date ? new Date(event.date) : null;
    const today = new Date();
    const daysUntil = eventDate ? Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24)) : null;

    const attendanceRate = totalGuests > 0 ? Math.round((checkedInGuests.length / totalGuests) * 100) : 0;

    return (
        <div className="event-tab-page">
            {/* Hero Section */}
            <div className="hero-card hero-card-event">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 12, backdropFilter: 'blur(4px)' }}>
                        <Calendar size={12} />
                        {daysUntil !== null ? (daysUntil > 0 ? `${daysUntil} Days Away` : daysUntil === 0 ? 'Today!' : 'Event Passed') : 'No Date Set'}
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{event.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, opacity: 0.9 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} />
                            {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                        </span>
                        {event.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={14} />
                                {event.location}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="tab-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                <div className="stats-card" onClick={() => navigate('/scanner')} style={{ cursor: 'pointer', padding: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                        <Users size={20} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Scan Guest</span>
                </div>
                <div className="stats-card" onClick={() => onTabChange && onTabChange('guests')} style={{ cursor: 'pointer', padding: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                        <Users size={20} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Guest List</span>
                </div>
                <div className="stats-card" onClick={() => onTabChange && onTabChange('budget')} style={{ cursor: 'pointer', padding: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                        <DollarSign size={20} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Budget</span>
                </div>
            </div>

            {/* At a Glance Stats */}
            <h3 className="section-title">At a Glance</h3>
            <div className="tab-stats-grid">
                {/* RSVP Card (Span 2) */}
                <div className="stats-card" style={{ gridColumn: 'span 2', flexDirection: 'row', justifyContent: 'space-between', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={24} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{totalGuests}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Invited Guests</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{confirmedGuests.length} Going</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{declinedRSVP} Declined</div>
                    </div>
                </div>

                {/* Checked In */}
                <div className="stats-card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Checked In</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{checkedInGuests.length}</span>
                        <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{attendanceRate}%</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${attendanceRate}%`, height: '100%', background: '#10b981' }} />
                    </div>
                </div>

                {/* Pending Tasks */}
                <div className="stats-card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Pending Tasks</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{pendingTasks.length}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>/ {totalTasks}</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${totalTasks > 0 ? ((totalTasks - pendingTasks.length) / totalTasks) * 100 : 0}%`, height: '100%', background: 'var(--warning)' }} />
                    </div>
                </div>
            </div>

            {/* List Preview (Tasks) */}
            {event.tasks && event.tasks.length > 0 && pendingTasks.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <h3 className="section-title">Action Items</h3>
                    <div className="tab-list">
                        {pendingTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="tab-list-item">
                                <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--text-tertiary)' }} />
                                <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{task.text || task.title}</div>
                                {task.assignee && (
                                    <div style={{ fontSize: 11, padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 10, color: 'var(--text-secondary)' }}>{task.assignee}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guest Modal */}
            {showGuestModal && (
                <div className="modal-overlay" onClick={() => setShowGuestModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="section-header">
                            <h3 className="section-title">{modalTitle}</h3>
                            <button onClick={() => setShowGuestModal(false)} style={{ border: 'none', background: 'transparent' }}><X size={20} /></button>
                        </div>
                        <div className="tab-list">
                            {modalGuests.length === 0 ? (
                                <div className="tab-empty-state">No guests found</div>
                            ) : (
                                modalGuests.map(guest => (
                                    <div key={guest.id} className="tab-list-item">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{guest.name}</div>
                                            {guest.phone && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{guest.phone}</div>}
                                        </div>
                                        {guest.attended && <CheckCircle size={16} color="#10b981" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
