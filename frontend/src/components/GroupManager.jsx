import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, UserPlus } from 'lucide-react';
import GroupMemberSelector from './GroupMemberSelector';

const API_URL = import.meta.env.VITE_API_URL || 'https://gatherly-backend-wl0v.onrender.com';

const GroupManager = () => {
    const [groups, setGroups] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', color: '#6B7280' });
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const colorOptions = [
        { label: 'Gray', value: '#6B7280' },
        { label: 'Red', value: '#EF4444' },
        { label: 'Orange', value: '#F97316' },
        { label: 'Yellow', value: '#EAB308' },
        { label: 'Green', value: '#10B981' },
        { label: 'Blue', value: '#3B82F6' },
        { label: 'Purple', value: '#A855F7' },
        { label: 'Pink', value: '#EC4899' },
    ];

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/contact-groups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const url = editingGroup
                ? `${API_URL}/contact-groups/${editingGroup.id}`
                : `${API_URL}/contact-groups`;

            console.log('Creating group with URL:', url);
            console.log('Request data:', formData);

            const response = await fetch(url, {
                method: editingGroup ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            if (!response.ok) {
                // Try to parse as JSON if content-type is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to save group');
                } else {
                    const text = await response.text();
                    console.error('Non-JSON error response:', text);
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('Group created:', data);

            await fetchGroups();
            closeModal();
        } catch (error) {
            console.error('Full error:', error);
            alert(error.message);
        }
    };

    const handleDelete = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/contact-groups/${groupId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete group');

            await fetchGroups();
            setDeleteConfirm(null);
        } catch (error) {
            alert('Failed to delete group');
        }
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setFormData({
            name: group.name,
            description: group.description || '',
            color: group.color || '#6B7280'
        });
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingGroup(null);
        setFormData({ name: '', description: '', color: '#6B7280' });
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading groups...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Create Group
                </button>
            </div>

            {/* Groups Grid */}
            {groups.length === 0 ? (
                <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                    <Users size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        No groups created yet.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={18} /> Create Your First Group
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {groups.map(group => (
                        <div
                            key={group.id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                borderLeft: `4px solid ${group.color}`,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => setSelectedGroup(group)}
                        >
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    {group.name}
                                </h3>
                                {group.description && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                        {group.description}
                                    </p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                    <Users size={14} />
                                    <span>{group.member_count || 0} member{group.member_count !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }} onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => handleEdit(group)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem', flex: 1, justifyContent: 'center' }}
                                    title="Edit group"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(group)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem', flex: 1, justifyContent: 'center', background: '#ef4444', color: 'white', border: 'none' }}
                                    title="Delete group"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={closeModal}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {editingGroup ? 'Edit Group' : 'Create Group'}
                            </h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Group Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Family, Friends, Coworkers..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description..."
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>Color</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                    {colorOptions.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            style={{
                                                padding: '0.75rem',
                                                border: formData.color === color.value ? '2px solid var(--primary)' : '2px solid transparent',
                                                borderRadius: '8px',
                                                background: color.value,
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {color.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-secondary"
                                    style={{ justifyContent: 'center' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ justifyContent: 'center' }}
                                >
                                    {editingGroup ? 'Update' : 'Create'} Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={() => setDeleteConfirm(null)}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Delete Group?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? Contacts will remain in your library.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="btn btn-secondary"
                                style={{ justifyContent: 'center' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="btn btn-primary"
                                style={{ justifyContent: 'center', background: '#ef4444', border: 'none' }}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Selector Modal */}
            {selectedGroup && (
                <GroupMemberSelector
                    group={selectedGroup}
                    onClose={() => {
                        setSelectedGroup(null);
                        fetchGroups();
                    }}
                />
            )}
        </div>
    );
};

export default GroupManager;
