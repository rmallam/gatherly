import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import QRGenerator from '../components/QRGenerator';
import BulkImport from '../components/BulkImport';
import ContactPicker from '../components/ContactPicker';
import ContactSelector from '../components/ContactSelector';
import { exportAllGuests, exportCheckedInGuests } from '../utils/csvExport';
import { UserPlus, QrCode, Search, CheckCircle2, ArrowLeft, Users, Upload, Smartphone, Download, Share2, Plus, X, MessageCircle, Trash2 } from 'lucide-react';

const EventDetails = () => {
    const { id } = useParams();
    const { getEvent, addGuest, addBulkGuests, deleteGuest } = useApp();
    const event = getEvent(id);

    const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
    const [search, setSearch] = useState('');
    const [showQR, setShowQR] = useState(null);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [showContactPicker, setShowContactPicker] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [showAddGuestModal, setShowAddGuestModal] = useState(false);
    const [sharedGuestId, setSharedGuestId] = useState(null);
    const [invitingGuest, setInvitingGuest] = useState(null);
    const [addingGuest, setAddingGuest] = useState(false);
    const [deleteConfirmGuest, setDeleteConfirmGuest] = useState(null);

    if (!event) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Event not found</h2>
                <Link to="/manager" className="btn btn-secondary">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    const handleAddGuest = async (e, shouldInvite = false) => {
        e.preventDefault();
        if (!newGuest.name.trim() || addingGuest) return;

        // Check for duplicates
        const isDuplicate = event.guests.some(g =>
            g.name.toLowerCase() === newGuest.name.trim().toLowerCase() &&
            (!newGuest.phone || g.phone === newGuest.phone)
        );

        if (isDuplicate) {
            alert('This guest has already been added!');
            return;
        }

        setAddingGuest(true);
        try {
            const addedGuest = await addGuest(id, {
                name: newGuest.name.trim(),
                phone: newGuest.phone.trim()
            });

            if (shouldInvite && addedGuest) {
                // Share invitation after adding
                setTimeout(() => handleInviteGuest(addedGuest), 500);
            }

            // Clear form and close modal on success
            setNewGuest({ name: '', phone: '' });
            setShowAddGuestModal(false);
        } catch (error) {
            console.error('Failed to add guest:', error);
            alert('Failed to add guest. Please try again.');
        } finally {
            setAddingGuest(false);
        }
    };

    const handleBulkImport = (contacts) => {
        addBulkGuests(id, contacts);
    };

    const handleSelectContacts = async (selectedContacts, shouldInvite = false) => {
        // Filter out duplicates before adding
        const uniqueContacts = selectedContacts.filter(contact => {
            const isDuplicate = event.guests.some(g =>
                (g.name.toLowerCase() === contact.name.toLowerCase()) ||
                (contact.phone && g.phone === contact.phone)
            );
            return !isDuplicate;
        });

        if (uniqueContacts.length === 0) {
            alert('All selected contacts have already been added as guests!');
            return;
        }

        if (uniqueContacts.length < selectedContacts.length) {
            const skipped = selectedContacts.length - uniqueContacts.length;
            alert(`${skipped} duplicate${skipped > 1 ? 's' : ''} skipped. Adding ${uniqueContacts.length} new guest${uniqueContacts.length > 1 ? 's' : ''}.`);
        }

        const guests = uniqueContacts.map(contact => ({
            name: contact.name,
            phone: contact.phone,
            email: contact.email || ''
        }));

        await addBulkGuests(id, guests);

        // If shouldInvite is true, share invitation for each guest with phone
        if (shouldInvite && guests.length > 0) {
            // Wait a moment for guests to be added
            setTimeout(async () => {
                const updatedEvent = getEvent(id);
                const newlyAddedGuests = updatedEvent.guests.slice(-guests.length);

                for (const guest of newlyAddedGuests) {
                    if (guest.phone) {
                        await handleInviteGuest(guest);
                        // Small delay between invites
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            }, 500);
        }
    };

    // WhatsApp-specific invite
    const handleWhatsAppInvite = async (guest) => {
        if (invitingGuest) return;

        try {
            setInvitingGuest(guest.id);

            if (!guest.phone) {
                alert('No phone number for this guest!');
                return;
            }

            const baseUrl = window.location.origin.includes('localhost')
                ? (import.meta.env.VITE_APP_URL || 'https://gatherly-backend-3vmv.onrender.com')
                : window.location.origin;

            const guestQRUrl = `${baseUrl}/invite/${id}?guest=${guest.id}`;
            const inviteText = `You're invited to ${event.title}!\n\nEvent Details:\n${event.venue ? `Venue: ${event.venue}\n` : ''}${event.date ? `Date: ${new Date(event.date).toLocaleDateString()}\n` : ''}${event.time ? `Time: ${event.time}\n` : ''}\n\nRSVP here: ${guestQRUrl}`;

            const cleanPhone = guest.phone.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(inviteText)}`;

            window.open(whatsappUrl, '_blank');

            setSharedGuestId(guest.id);
            setTimeout(() => setSharedGuestId(null), 2000);
        } catch (err) {
            console.error('Error sending WhatsApp invite:', err);
            alert(`Failed to send WhatsApp invitation: ${err.message}`);
        } finally {
            setInvitingGuest(null);
        }
    };

    // Generic share dialog
    const handleInviteGuest = async (guest) => {
        if (invitingGuest) return;

        try {
            setInvitingGuest(guest.id);

            const baseUrl = window.location.origin.includes('localhost')
                ? (import.meta.env.VITE_APP_URL || 'https://gatherly-backend-3vmv.onrender.com')
                : window.location.origin;

            const guestQRUrl = `${baseUrl}/invite/${id}?guest=${guest.id}`;
            const inviteText = `You're invited to ${event.title}!\n\nEvent Details:\n${event.venue ? `Venue: ${event.venue}\n` : ''}${event.date ? `Date: ${new Date(event.date).toLocaleDateString()}\n` : ''}${event.time ? `Time: ${event.time}\n` : ''}\n\nRSVP here: ${guestQRUrl}`;

            const { Share } = await import('@capacitor/share');

            try {
                await Share.share({
                    title: `Invitation to ${event.title}`,
                    text: inviteText,
                    dialogTitle: `Invite ${guest.name}`
                });

                setSharedGuestId(guest.id);
                setTimeout(() => setSharedGuestId(null), 2000);
            } catch (shareErr) {
                if (shareErr.message && !shareErr.message.includes('canceled') && !shareErr.message.includes('cancelled')) {
                    console.error('Share failed:', shareErr);

                    try {
                        await navigator.clipboard.writeText(inviteText);
                        alert('Share failed. Invitation copied to clipboard instead!');
                    } catch (clipErr) {
                        console.error('Clipboard fallback failed:', clipErr);
                        alert('Failed to share invitation. Please try again.');
                    }
                }
            }
        } catch (err) {
            console.error('Error inviting guest:', err);
            alert(`Failed to send invitation: ${err.message}`);
        } finally {
            setInvitingGuest(null);
        }
    };

    const handleDeleteGuest = async (guest) => {
        try {
            await deleteGuest(id, guest.id);
            setDeleteConfirmGuest(null);
        } catch (err) {
            console.error('Error deleting guest:', err);
            alert('Failed to delete guest. Please try again.');
        }
    };

    const filteredGuests = event.guests?.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.phone.includes(search)
    ).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)) || [];

    const totalGuests = event.guests?.length || 0;
    const checkedInGuests = event.guests?.filter(g => g.attended).length || 0;

    return (
        <div style={{ maxWidth: '75rem', margin: '0 auto' }}>
            {/* Simple Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/manager" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Back to Events
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Guests
                        </h1>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                            {totalGuests} invited • {checkedInGuests} checked in
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            onClick={() => exportAllGuests(event)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.875rem' }}
                        >
                            <Download size={16} /> Export
                        </button>
                        <button
                            onClick={() => setShowAddGuestModal(true)}
                            className="btn btn-primary"
                        >
                            <Plus size={18} /> Add Guest
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="input"
                        style={{ paddingLeft: '2.75rem' }}
                        placeholder="Search guests by name or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Guest Cards */}
            {filteredGuests.length === 0 ? (
                <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                    <Users size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {search ? 'No guests found matching your search.' : 'No guests added yet.'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setShowAddGuestModal(true)}
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                        >
                            <Plus size={18} /> Add Your First Guest
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {filteredGuests.map(guest => (
                        <div key={guest.id} className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                {/* Guest Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                                        {guest.name}
                                    </h4>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {guest.phone ? (
                                            <a href={`tel:${guest.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                📞 {guest.phone}
                                            </a>
                                        ) : (
                                            <span>No phone</span>
                                        )}
                                        {guest.attended && (
                                            <span className="badge badge-success">
                                                <CheckCircle2 size={12} /> Checked In
                                            </span>
                                        )}
                                        {guest.rsvp === true && !guest.attended && (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                color: '#059669',
                                                background: '#d1fae5',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem'
                                            }}>
                                                ✓ Confirmed
                                            </span>
                                        )}
                                        {guest.rsvp === false && (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                color: '#dc2626',
                                                background: '#fee2e2',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem'
                                            }}>
                                                ✕ Declined
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    {/* WhatsApp Button */}
                                    {guest.phone && (
                                        <button
                                            onClick={() => handleWhatsAppInvite(guest)}
                                            className="btn btn-secondary"
                                            style={{
                                                fontSize: '0.875rem',
                                                padding: '0.5rem 0.875rem',
                                                background: '#25D366',
                                                color: 'white',
                                                border: 'none'
                                            }}
                                            title="Send via WhatsApp"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                        </button>
                                    )}
                                    {/* Generic Share Button */}
                                    <button
                                        onClick={() => handleInviteGuest(guest)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                                        title="Share invitation"
                                    >
                                        {sharedGuestId === guest.id ? (
                                            <><CheckCircle2 size={16} /> Shared!</>
                                        ) : (
                                            <><Share2 size={16} /></>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowQR(guest.id)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                                    >
                                        <QrCode size={16} /> QR
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirmGuest(guest)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem', background: '#ef4444', color: 'white', border: 'none' }}
                                        title="Delete guest"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {showQR === guest.id && (
                                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={() => setShowQR(null)}>
                                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                                        {/* Close Button */}
                                        <button
                                            onClick={() => setShowQR(null)}
                                            style={{
                                                position: 'absolute',
                                                top: '-12px',
                                                right: '-12px',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px',
                                                color: '#64748b',
                                                fontWeight: 'bold',
                                                zIndex: 10,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = '#ef4444';
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.color = '#64748b';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <X size={24} />
                                        </button>

                                        <QRGenerator
                                            name={guest.name}
                                            eventTitle={event.title}
                                            phoneNumber={guest.phone}
                                            payload={{
                                                eventId: event.id,
                                                guestId: guest.id,
                                                name: guest.name,
                                                valid: true,
                                                timestamp: Date.now()
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Guest Modal */}
            {showAddGuestModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={() => setShowAddGuestModal(false)}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Add Guest</h3>
                            <button onClick={() => setShowAddGuestModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newGuest.name}
                                    onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone (optional)</label>
                                <input
                                    type="tel"
                                    className="input"
                                    value={newGuest.phone}
                                    onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            {/* Two Button Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={(e) => handleAddGuest(e, false)}
                                    className="btn btn-secondary"
                                    style={{ justifyContent: 'center' }}
                                    disabled={addingGuest}
                                >
                                    <UserPlus size={16} /> {addingGuest ? 'Adding...' : 'Add to List'}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleAddGuest(e, true)}
                                    className="btn btn-primary"
                                    style={{ justifyContent: 'center' }}
                                    disabled={addingGuest}
                                >
                                    <Share2 size={16} /> {addingGuest ? 'Adding...' : 'Add & Invite'}
                                </button>
                            </div>
                        </form>

                        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>Quick Import</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddGuestModal(false); setShowContactSelector(true); }}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <Users size={16} /> Add from Contacts
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddGuestModal(false); setShowBulkImport(true); }}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <Upload size={16} /> Import from CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddGuestModal(false); setShowContactPicker(true); }}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <Smartphone size={16} /> Import from Phone
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {showBulkImport && (
                <BulkImport
                    onImport={handleBulkImport}
                    onClose={() => setShowBulkImport(false)}
                />
            )}

            {/* Contact Picker Modal */}
            {showContactPicker && (
                <ContactPicker
                    onImport={handleBulkImport}
                    onClose={() => setShowContactPicker(false)}
                />
            )}

            {/* Contact Selector Modal */}
            {showContactSelector && (
                <ContactSelector
                    isOpen={showContactSelector}
                    onClose={() => setShowContactSelector(false)}
                    onSelectContacts={handleSelectContacts}
                    event={event}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmGuest && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={() => setDeleteConfirmGuest(null)}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Delete Guest?</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Are you sure you want to delete <strong>{deleteConfirmGuest.name}</strong>? This action cannot be undone.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => setDeleteConfirmGuest(null)}
                                    className="btn btn-secondary"
                                    style={{ justifyContent: 'center' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteGuest(deleteConfirmGuest)}
                                    className="btn btn-primary"
                                    style={{ justifyContent: 'center', background: '#ef4444', border: 'none' }}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails;
