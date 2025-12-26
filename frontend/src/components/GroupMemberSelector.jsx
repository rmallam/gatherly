import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://gatherly-backend-wl0v.onrender.com';

const GroupMemberSelector = ({ group, onClose }) => {
    const { contacts } = useApp();
    const [members, setMembers] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState(new Set());
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroupMembers();
    }, [group.id]);

    const fetchGroupMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contact-groups/${group.id}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMembers(data);
                // Pre-select current members
                const memberIds = new Set(data.map(m => m.id));
                setSelectedContacts(memberIds);
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (contactId) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(contactId)) {
            newSelected.delete(contactId);
        } else {
            newSelected.add(contactId);
        }
        setSelectedContacts(newSelected);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');

            // Get current member IDs
            const currentMemberIds = new Set(members.map(m => m.id));

            // Find contacts to add (selected but not in members)
            const toAdd = Array.from(selectedContacts).filter(id => !currentMemberIds.has(id));

            // Find contacts to remove (in members but not selected)
            const toRemove = Array.from(currentMemberIds).filter(id => !selectedContacts.has(id));

            // Add new members
            if (toAdd.length > 0) {
                await fetch(`${API_URL}/api/contact-groups/${group.id}/members`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ contactIds: toAdd })
                });
            }

            // Remove members
            for (const contactId of toRemove) {
                await fetch(`${API_URL}/api/contact-groups/${group.id}/members/${contactId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            onClose();
        } catch (error) {
            console.error('Failed to update members:', error);
            alert('Failed to update group members');
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        (contact.phone && contact.phone.includes(search)) ||
        (contact.email && contact.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={onClose}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Manage Members
                        </h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={24} />
                        </button>
                    </div>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '8px', background: group.color, color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
                        {group.name}
                    </div>
                </div>

                {/* Search */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '2.75rem' }}
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            Loading...
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            No contacts found
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filteredContacts.map(contact => {
                                const isSelected = selectedContacts.has(contact.id);
                                return (
                                    <label
                                        key={contact.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                                            border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggle(contact.id)}
                                            style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                {contact.name}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {contact.phone || contact.email || 'No contact info'}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <UserMinus size={18} style={{ color: 'var(--primary)', marginLeft: '0.5rem' }} />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        <UserPlus size={18} /> Save ({selectedContacts.size} members)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupMemberSelector;
