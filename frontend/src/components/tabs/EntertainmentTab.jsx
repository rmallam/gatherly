import React, { useState } from 'react';
import { Music, Plus, X, Check, Trash2, Clock, Edit2 } from 'lucide-react';

const EntertainmentTab = ({ event, onUpdateEntertainment }) => {
    const [entertainment, setEntertainment] = useState(event.entertainment || {
        activities: [],
        playlist: []
    });
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newActivity, setNewActivity] = useState({
        name: '',
        time: '',
        duration: '',
        performer: '',
        notes: ''
    });

    const handleAddActivity = () => {
        if (!newActivity.name) return;

        const activity = {
            id: Date.now().toString(),
            ...newActivity
        };

        const updated = {
            ...entertainment,
            activities: [...(entertainment.activities || []), activity]
        };

        setEntertainment(updated);
        onUpdateEntertainment?.(updated);
        setNewActivity({ name: '', time: '', duration: '', performer: '', notes: '' });
        setShowAddActivity(false);
    };

    const handleDeleteActivity = (id) => {
        const updated = {
            ...entertainment,
            activities: entertainment.activities.filter(a => a.id !== id)
        };
        setEntertainment(updated);
        onUpdateEntertainment?.(updated);
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleUpdateItem = () => {
        if (!editingItem.name) return;

        const updated = {
            ...entertainment,
            activities: entertainment.activities.map(activity =>
                activity.id === editingItem.id ? { ...editingItem } : activity
            )
        };
        setEntertainment(updated);
        onUpdateEntertainment?.(updated);
        setEditingItem(null);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const activities = entertainment.activities || [];
    const sortedActivities = [...activities].sort((a, b) => {
        if (!a.time || !b.time) return 0;
        return a.time.localeCompare(b.time);
    });

    return (
        <div>
            {/* Add Button */}
            <button onClick={() => setShowAddActivity(!showAddActivity)} className="btn btn-primary" style={{ marginBottom: '1.5rem' }}>
                <Plus size={16} /> Add Activity
            </button>

            {/* Add Form */}
            {showAddActivity && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>New Activity</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Activity Name*</label>
                            <input type="text" className="form-input" value={newActivity.name} onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })} placeholder="e.g., DJ Performance, Games, Dance" autoFocus />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Start Time</label>
                                <input type="time" className="form-input" value={newActivity.time} onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Duration (minutes)</label>
                                <input type="number" className="form-input" value={newActivity.duration} onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })} placeholder="30" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Performer/Host (Optional)</label>
                                <input type="text" className="form-input" value={newActivity.performer} onChange={(e) => setNewActivity({ ...newActivity, performer: e.target.value })} placeholder="Name" />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Notes (Optional)</label>
                            <textarea className="form-input" value={newActivity.notes} onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })} placeholder="Equipment needed, special instructions, etc." rows={2} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleAddActivity} className="btn btn-primary"><Check size={16} /> Add Activity</button>
                        <button onClick={() => setShowAddActivity(false)} className="btn btn-secondary"><X size={16} /> Cancel</button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Activities</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{activities.length}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Scheduled</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
                        {activities.filter(a => a.time).length}
                    </div>
                </div>
            </div>


            {/* Timeline */}
            {sortedActivities.length > 0 && (
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} style={{ color: 'var(--primary)' }} />
                        Event Timeline
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {sortedActivities.map((activity, index) => (
                            <div key={activity.id} style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                                {/* Timeline dot */}
                                <div style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '0.5rem',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    border: '3px solid var(--bg-primary)'
                                }}></div>
                                {/* Timeline line */}
                                {index < sortedActivities.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '5px',
                                        top: '1.5rem',
                                        bottom: '-1rem',
                                        width: '2px',
                                        background: 'var(--border)'
                                    }}></div>
                                )}
                                {/* Content */}
                                {editingItem?.id === activity.id ? (
                                    // EDIT FORM
                                    <div className="card" style={{ padding: '1rem' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Edit Activity</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Activity Name</label>
                                                <input type="text" className="form-input" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ padding: '0.5rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Time</label>
                                                <input type="time" className="form-input" value={editingItem.time} onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })} style={{ padding: '0.5rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Duration (mins)</label>
                                                <input type="text" className="form-input" value={editingItem.duration} onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })} style={{ padding: '0.5rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Performer/Host</label>
                                                <input type="text" className="form-input" value={editingItem.performer || ''} onChange={(e) => setEditingItem({ ...editingItem, performer: e.target.value })} style={{ padding: '0.5rem' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={handleUpdateItem} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                                <Check size={14} /> Save
                                            </button>
                                            <button onClick={handleCancelEdit} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                                <X size={14} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // DISPLAY
                                    <div style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{activity.name}</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {activity.time && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Clock size={14} />
                                                            {activity.time}
                                                        </div>
                                                    )}
                                                    {activity.duration && <span>⏱️ {activity.duration} mins</span>}
                                                    {activity.performer && <span>🎤 {activity.performer}</span>}
                                                </div>
                                                {activity.notes && (
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                        {activity.notes}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button onClick={() => handleEditItem(activity)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} title="Edit activity">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteActivity(activity.id)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {activities.length === 0 && !showAddActivity && (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Music size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Activities Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Plan your entertainment schedule and activities
                    </p>
                    <button onClick={() => setShowAddActivity(true)} className="btn btn-primary">
                        <Plus size={16} /> Add First Activity
                    </button>
                </div>
            )}
        </div>
    );
};

export default EntertainmentTab;
