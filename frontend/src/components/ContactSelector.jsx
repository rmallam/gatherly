import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Search, Users, Check, AlertCircle, FolderOpen } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ContactSelector = ({ isOpen, onClose, onSelectContacts, event }) => {
    const { contacts } = useApp();
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' or 'groups'
    const [groups, setGroups] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groupContacts, setGroupContacts] = useState({});

    // Fetch contact groups when dialog opens
    useEffect(() => {
        if (isOpen && activeTab === 'groups') {
            fetchGroups();
        }
    }, [isOpen, activeTab]);

    const fetchGroups = async () => {
        setLoadingGroups(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contact-groups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoadingGroups(false);
        }
    };

    const fetchGroupContacts = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contact-groups/${groupId}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setGroupContacts(prev => ({ ...prev, [groupId]: data }));
            }
        } catch (error) {
            console.error('Error fetching group contacts:', error);
        }
    };

    if (!isOpen) return null;

    // Check if contact is already a guest (by phone or exact name match)
    const isAlreadyGuest = useMemo(() => {
        const existingGuests = event?.guests || [];
        return (contact) => {
            return existingGuests.some(guest =>
                (guest.phone && contact.phone && guest.phone === contact.phone) ||
                (guest.name.toLowerCase() === contact.name.toLowerCase())
            );
        };
    }, [event]);

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.phone.includes(search)
    );

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelect = (contactId) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(contactId)) {
            newSelected.delete(contactId);
        } else {
            newSelected.add(contactId);
        }
        setSelectedIds(newSelected);
    };

    const toggleGroupSelect = async (groupId) => {
        const newSelected = new Set(selectedGroupIds);
        if (newSelected.has(groupId)) {
            newSelected.delete(groupId);
        } else {
            newSelected.add(groupId);
            // Fetch contacts for this group if not already loaded
            if (!groupContacts[groupId]) {
                await fetchGroupContacts(groupId);
            }
        }
        setSelectedGroupIds(newSelected);
    };

    const handleAdd = async (shouldInvite = false) => {
        let selectedContacts = [];

        if (activeTab === 'contacts') {
            selectedContacts = contacts.filter(c => selectedIds.has(c.id));
        } else {
            // Collect all contacts from selected groups
            const allGroupContacts = [];
            for (const groupId of selectedGroupIds) {
                const contacts = groupContacts[groupId] || [];
                allGroupContacts.push(...contacts);
            }

            // Deduplicate by phone/name
            const seen = new Set();
            selectedContacts = allGroupContacts.filter(contact => {
                const key = contact.phone || contact.name.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        onSelectContacts(selectedContacts, shouldInvite);
        setSelectedIds(new Set());
        setSelectedGroupIds(new Set());
        setSearch('');
        onClose();
    };

    const getSelectedCount = () => {
        if (activeTab === 'contacts') {
            return selectedIds.size;
        } else {
            // Count unique contacts from selected groups
            const allContacts = [];
            for (const groupId of selectedGroupIds) {
                const contacts = groupContacts[groupId] || [];
                allContacts.push(...contacts);
            }
            const seen = new Set();
            return allContacts.filter(contact => {
                const key = contact.phone || contact.name.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }).length;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="card" style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                        Import Contacts
                    </h2>
                    <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: `3px solid ${activeTab === 'contacts' ? 'var(--primary)' : 'transparent'}`,
                            color: activeTab === 'contacts' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === 'contacts' ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Users size={18} />
                        Contacts
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: `3px solid ${activeTab === 'groups' ? 'var(--primary)' : 'transparent'}`,
                            color: activeTab === 'groups' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === 'groups' ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FolderOpen size={18} />
                        Groups
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            className="form-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={activeTab === 'contacts' ? "Search by name or phone..." : "Search groups..."}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {activeTab === 'contacts' ? (
                        // Contacts Tab
                        filteredContacts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No contacts found</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {filteredContacts.map(contact => {
                                    const isDuplicate = isAlreadyGuest(contact);
                                    return (
                                        <label
                                            key={contact.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-md)',
                                                background: isDuplicate ? '#f3f4f6' : (selectedIds.has(contact.id) ? 'var(--bg-secondary)' : 'transparent'),
                                                border: `2px solid ${isDuplicate ? '#e5e7eb' : (selectedIds.has(contact.id) ? 'var(--primary)' : 'var(--border)')}`,
                                                cursor: isDuplicate ? 'not-allowed' : 'pointer',
                                                opacity: isDuplicate ? 0.6 : 1,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(contact.id)}
                                                onChange={() => toggleSelect(contact.id)}
                                                disabled={isDuplicate}
                                                style={{ cursor: isDuplicate ? 'not-allowed' : 'pointer', width: '18px', height: '18px' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {contact.name}
                                                    {isDuplicate && (
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                                                            (Already added)
                                                        </span>
                                                    )}
                                                </div>
                                                {contact.phone && (
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{contact.phone}</div>
                                                )}
                                            </div>
                                            {selectedIds.has(contact.id) && !isDuplicate && (
                                                <Check size={20} style={{ color: 'var(--primary)' }} />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // Groups Tab
                        loadingGroups ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <p>Loading groups...</p>
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No groups found</p>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Create contact groups in the Contacts page</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {filteredGroups.map(group => (
                                    <label
                                        key={group.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: selectedGroupIds.has(group.id) ? 'var(--bg-secondary)' : 'transparent',
                                            border: `2px solid ${selectedGroupIds.has(group.id) ? 'var(--primary)' : 'var(--border)'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGroupIds.has(group.id)}
                                            onChange={() => toggleGroupSelect(group.id)}
                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                        />
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: group.color || '#6B7280'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {group.name}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {group.member_count || 0} contacts
                                            </div>
                                        </div>
                                        {selectedGroupIds.has(group.id) && (
                                            <Check size={20} style={{ color: 'var(--primary)' }} />
                                        )}
                                    </label>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {getSelectedCount()} contacts selected
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button
                            onClick={() => handleAdd(false)}
                            className="btn btn-secondary"
                            disabled={getSelectedCount() === 0}
                        >
                            <Check size={16} /> Add to List
                        </button>
                        <button
                            onClick={() => handleAdd(true)}
                            className="btn btn-primary"
                            disabled={getSelectedCount() === 0}
                        >
                            <Check size={16} /> Add & Invite All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSelector;
