import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, Edit2, Trash2, Plus, X, Mail, Phone as PhoneIcon, Calendar, Upload } from 'lucide-react';
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';

const MyContacts = () => {
    const { contacts, addContact, updateContact, deleteContact } = useApp();
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
    const [importing, setImporting] = useState(false);

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        (contact.phone && contact.phone.includes(search)) ||
        (contact.email && contact.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingContact) {
                await updateContact(editingContact.id, formData);
            } else {
                await addContact(formData);
            }

            setShowAddModal(false);
            setEditingContact(null);
            setFormData({ name: '', phone: '', email: '', notes: '' });
        } catch (error) {
            alert(error.message || 'Failed to save contact');
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            phone: contact.phone || '',
            email: contact.email || '',
            notes: contact.notes || ''
        });
        setShowAddModal(true);
    };

    const handleDelete = async (contactId) => {
        try {
            await deleteContact(contactId);
            setDeleteConfirm(null);
        } catch (error) {
            alert('Failed to delete contact');
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingContact(null);
        setFormData({ name: '', phone: '', email: '', notes: '' });
    };

    const handleImportFromPhone = async () => {
        if (!Capacitor.isNativePlatform()) {
            alert('This feature only works on mobile devices');
            return;
        }

        try {
            setImporting(true);

            const permission = await Contacts.requestPermissions();
            if (permission.contacts !== 'granted') {
                alert('Permission denied to access contacts');
                return;
            }

            const result = await Contacts.getContacts({
                projection: {
                    name: true,
                    phones: true,
                    emails: true
                }
            });

            if (!result.contacts || result.contacts.length === 0) {
                alert('No contacts found');
                return;
            }

            // Filter and transform contacts
            const contactsToImport = result.contacts
                .filter(c => c.name?.display && (c.phones?.length > 0 || c.emails?.length > 0))
                .map(c => ({
                    name: c.name.display,
                    phone: c.phones?.[0]?.number || '',
                    email: c.emails?.[0]?.address || '',
                    notes: ''
                }));

            if (contactsToImport.length === 0) {
                alert('No valid contacts to import');
                return;
            }

            // Import contacts one by one
            let successCount = 0;
            let skipCount = 0;

            for (const contact of contactsToImport) {
                try {
                    await addContact(contact);
                    successCount++;
                } catch (err) {
                    // Skip duplicates or invalid contacts
                    skipCount++;
                }
            }

            alert(`Imported ${successCount} contacts${skipCount > 0 ? `, skipped ${skipCount} duplicates` : ''}`);
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import contacts: ' + error.message);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: 'calc(60px + env(safe-area-inset-bottom))' }}>

            <div className="container" style={{ padding: '2rem 1rem 1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            My Contacts
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {contacts.length} saved contact{contacts.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleImportFromPhone}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            disabled={importing}
                        >
                            <Upload size={18} /> {importing ? 'Importing...' : 'Import'}
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} /> Add Contact
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
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

                {/* Contacts List */}
                {filteredContacts.length === 0 ? (
                    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                        <Users size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            {search ? 'No contacts found matching your search.' : 'No contacts saved yet.'}
                        </p>
                        {!search && (
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleImportFromPhone}
                                    className="btn btn-secondary"
                                >
                                    <Upload size={18} /> Import from Phone
                                </button>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn btn-primary"
                                >
                                    <Plus size={18} /> Add Your First Contact
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {filteredContacts.map(contact => (
                            <div key={contact.id} className="card" style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                            {contact.name}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {contact.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <PhoneIcon size={14} />
                                                    <a href={`tel:${contact.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                        {contact.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {contact.email && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Mail size={14} />
                                                    <a href={`mailto:${contact.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                        {contact.email}
                                                    </a>
                                                </div>
                                            )}
                                            {contact.events_count > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                    <Calendar size={14} />
                                                    <span>Used in {contact.events_count} event{contact.events_count !== 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                        </div>
                                        {contact.notes && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                                                {contact.notes}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                        <button
                                            onClick={() => handleEdit(contact)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem', minWidth: 'auto' }}
                                            title="Edit contact"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(contact)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem', minWidth: 'auto', background: '#ef4444', color: 'white', border: 'none' }}
                                            title="Delete contact"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={closeModal}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {editingContact ? 'Edit Contact' : 'Add Contact'}
                            </h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+919876543210"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes</label>
                                <textarea
                                    className="form-input"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Optional notes..."
                                    rows={3}
                                />
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
                                    {editingContact ? 'Update' : 'Add'} Contact
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Delete Contact?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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
        </div>
    );
};

export default MyContacts;
