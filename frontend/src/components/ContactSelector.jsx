import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { X, Search, Users, Check, AlertCircle } from 'lucide-react';

const ContactSelector = ({ isOpen, onClose, onSelectContacts, event }) => {
    const { contacts } = useApp();
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());

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

    const toggleSelect = (contactId) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(contactId)) {
            newSelected.delete(contactId);
        } else {
            newSelected.add(contactId);
        }
        setSelectedIds(newSelected);
    };

    const handleAdd = () => {
        const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
        onSelectContacts(selectedContacts);
        setSelectedIds(new Set());
        setSearch('');
        onClose();
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
                        Select from Contacts
                    </h2>
                    <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                        <X size={20} />
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
                            placeholder="Search by name or phone..."
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {filteredContacts.length === 0 ? (
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
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {selectedIds.size} selected
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
                                onSelectContacts(selectedContacts, false);
                                setSelectedIds(new Set());
                                setSearch('');
                                onClose();
                            }}
                            className="btn btn-secondary"
                            disabled={selectedIds.size === 0}
                        >
                            <Check size={16} /> Add to List
                        </button>
                        <button
                            onClick={() => {
                                const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
                                onSelectContacts(selectedContacts, true);
                                setSelectedIds(new Set());
                                setSearch('');
                                onClose();
                            }}
                            className="btn btn-primary"
                            disabled={selectedIds.size === 0}
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
