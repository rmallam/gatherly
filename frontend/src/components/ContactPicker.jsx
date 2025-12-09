import React, { useState, useEffect } from 'react';
import { X, Users, Search, Smartphone, AlertCircle } from 'lucide-react';

const ContactPicker = ({ onImport, onClose }) => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        loadContactsPlugin();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = contacts.filter(c =>
                c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.phoneNumbers?.some(p => p.number?.includes(search))
            );
            setFilteredContacts(filtered);
        } else {
            setFilteredContacts(contacts);
        }
    }, [search, contacts]);

    const loadContactsPlugin = async () => {
        try {
            // Check if we're running in a native app (not web)
            const { Capacitor } = await import('@capacitor/core');

            if (!Capacitor.isNativePlatform()) {
                setError('📱 Contact import only works in the native Android app.\n\nTo use this feature:\n1. Build the Android APK\n2. Install it on your phone\n3. Grant contacts permission');
                setLoading(false);
                return;
            }

            // Dynamically import the Contacts plugin
            const packageName = '@capacitor-community/contacts';
            const module = await import(/* @vite-ignore */ packageName);
            await requestPermissionAndLoadContacts(module.Contacts);
        } catch (err) {
            console.error('Contacts plugin not available:', err);
            setError('Contact import requires the native Android app. This feature is not available in the web browser.');
            setLoading(false);
        }
    };

    const requestPermissionAndLoadContacts = async (ContactsAPI) => {
        try {
            // Request permission
            const permission = await ContactsAPI.requestPermissions();

            if (permission.contacts === 'granted') {
                setPermissionGranted(true);
                await loadContacts(ContactsAPI);
            } else {
                setError('Permission denied. Please enable contacts access in your phone settings.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Error requesting contacts permission:', err);
            setError('Could not access contacts. This feature requires the native app.');
            setLoading(false);
        }
    };

    const loadContacts = async (ContactsAPI) => {
        try {
            const result = await ContactsAPI.getContacts({
                projection: {
                    name: true,
                    phones: true,
                }
            });

            // Transform contacts to our format
            const formattedContacts = result.contacts
                .filter(c => c.name?.display)
                .map(c => ({
                    id: c.contactId,
                    name: c.name.display,
                    phoneNumbers: c.phones || [],
                    primaryPhone: c.phones?.[0]?.number || ''
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setContacts(formattedContacts);
            setFilteredContacts(formattedContacts);
            setLoading(false);
        } catch (err) {
            console.error('Error loading contacts:', err);
            setError('Failed to load contacts');
            setLoading(false);
        }
    };

    const toggleContact = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleImport = () => {
        const selectedContacts = contacts
            .filter(c => selectedIds.has(c.id))
            .map(c => ({
                name: c.name,
                phone: c.primaryPhone
            }));

        if (selectedContacts.length > 0) {
            onImport(selectedContacts);
            onClose();
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
            <div className="card" style={{ maxWidth: '40rem', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Smartphone size={24} style={{ color: 'var(--primary)' }} />
                        Select Contacts
                    </h2>
                    <button onClick={onClose} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Loading / Error States */}
                {loading && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>Loading contacts...</p>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
                            <AlertCircle size={32} style={{ color: '#92400e', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '0.9375rem', color: '#92400e', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{error}</p>
                        </div>
                        <button onClick={onClose} className="btn btn-secondary">Close</button>
                    </div>
                )}

                {/* Main Content */}
                {!loading && !error && permissionGranted && (
                    <>
                        {/* Search */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="Search contacts..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Selection Info */}
                        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                            </span>
                            <span className="badge badge-primary">
                                {selectedIds.size} selected
                            </span>
                        </div>

                        {/* Contact List */}
                        <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                            {filteredContacts.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    <p>No contacts found</p>
                                </div>
                            ) : (
                                filteredContacts.map(contact => (
                                    <label
                                        key={contact.id}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(contact.id)}
                                            onChange={() => toggleContact(contact.id)}
                                            style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                {contact.name}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {contact.primaryPhone || 'No phone number'}
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={onClose} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="btn btn-primary"
                                disabled={selectedIds.size === 0}
                                style={{ opacity: selectedIds.size === 0 ? 0.5 : 1 }}
                            >
                                <Users size={16} /> Add {selectedIds.size} Contact{selectedIds.size !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ContactPicker;
