import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import QRGenerator from '../components/QRGenerator';
import BulkImport from '../components/BulkImport';
import ContactPicker from '../components/ContactPicker';
import ContactSelector from '../components/ContactSelector';
import { exportAllGuests, exportCheckedInGuests } from '../utils/csvExport';
import { UserPlus, QrCode, Search, CheckCircle2, ArrowLeft, Users, Upload, Smartphone, Download, Share2, Plus, X } from 'lucide-react';

const EventDetails = () => {
    const { id } = useParams();
    const { getEvent, addGuest, addBulkGuests } = useApp();
    const event = getEvent(id);

    const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
    const [search, setSearch] = useState('');
    const [showQR, setShowQR] = useState(null);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [showContactPicker, setShowContactPicker] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [showAddGuestModal, setShowAddGuestModal] = useState(false);
    const [sharedGuestId, setSharedGuestId] = useState(null);

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
        if (!newGuest.name) return;

        const addedGuest = await addGuest(id, newGuest);
        const guestData = { ...newGuest, id: addedGuest?.id || Date.now().toString() };

        if (shouldInvite) {
            // Share invitation after adding
            setTimeout(() => shareGuest(guestData), 500);
        }

        setNewGuest({ name: '', phone: '' });
        setShowAddGuestModal(false);
    };

    const handleBulkImport = (contacts) => {
        addBulkGuests(id, contacts);
    };

    const handleSelectContacts = async (selectedContacts, shouldInvite = false) => {
        const guests = selectedContacts.map(contact => ({
            name: contact.name,
            phone: contact.phone,
            email: contact.email || ''
        }));

        await addBulkGuests(id, guests);

        // If shouldInvite is true, share invitation for each guest with phone
        if (shouldInvite) {
            // Wait a moment for guests to be added
            setTimeout(async () => {
                const updatedEvent = getEvent(id);
                const newlyAddedGuests = updatedEvent.guests.slice(-guests.length);

                for (const guest of newlyAddedGuests) {
                    if (guest.phone) {
                        await shareGuest(guest);
                        // Small delay between invites
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            }, 500);
        }
    };

    const shareGuest = async (guest) => {
        const guestQRUrl = `${window.location.origin}/invite/${id}?guest=${guest.id}`;
        const invitationText = `🎉 You're invited to ${event.title}!

👤 Guest: ${guest.name}
📅 Event: ${event.title}${event.date ? `\n📆 Date: ${new Date(event.date).toLocaleDateString()}` : ''}${event.location ? `\n📍 Location: ${event.location}` : ''}

🎫 Your invitation link:
${guestQRUrl}

Show your QR code at the event to check in!`;

        try {
            // Generate QR code as image
            const canvas = document.createElement('canvas');
            const QRCode = (await import('qrcode.react')).QRCodeCanvas;
            const qrContainer = document.createElement('div');
            qrContainer.style.display = 'none';
            document.body.appendChild(qrContainer);

            // Render QR code to get canvas
            const { createRoot } = await import('react-dom/client');
            const root = createRoot(qrContainer);
            await new Promise((resolve) => {
                root.render(
                    React.createElement(QRCode, {
                        value: JSON.stringify({
                            eventId: id,
                            guestId: guest.id,
                            name: guest.name,
                            valid: true,
                            timestamp: Date.now()
                        }),
                        size: 512,
                        level: 'H'
                    })
                );
                setTimeout(resolve, 100);
            });

            const qrCanvas = qrContainer.querySelector('canvas');
            const qrBlob = await new Promise(resolve => qrCanvas.toBlob(resolve, 'image/png'));
            const qrFile = new File([qrBlob], `${guest.name}-invitation-qr.png`, { type: 'image/png' });

            // Cleanup
            root.unmount();
            document.body.removeChild(qrContainer);

            // If guest has phone, open WhatsApp with message
            if (guest.phone) {
                const cleanPhone = guest.phone.replace(/\D/g, '');
                const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(invitationText)}`;

                // Open WhatsApp
                window.location.href = whatsappUrl;

                // After a delay, share the QR code
                setTimeout(async () => {
                    if (navigator.canShare && navigator.canShare({ files: [qrFile] })) {
                        try {
                            await navigator.share({
                                files: [qrFile],
                                title: 'Event QR Code'
                            });
                        } catch (err) {
                            if (err.name !== 'AbortError') {
                                console.error('Error sharing QR:', err);
                            }
                        }
                    }
                }, 1500);

                setSharedGuestId(guest.id);
                setTimeout(() => setSharedGuestId(null), 3000);
            } else {
                // No phone - use native share with both text and QR
                if (navigator.canShare && navigator.canShare({ files: [qrFile], text: invitationText })) {
                    await navigator.share({
                        files: [qrFile],
                        text: invitationText,
                        title: `Invitation for ${guest.name}`
                    });
                    setSharedGuestId(guest.id);
                    setTimeout(() => setSharedGuestId(null), 2000);
                } else {
                    // Fallback to clipboard
                    await navigator.clipboard.writeText(invitationText);
                    setSharedGuestId(guest.id);
                    setTimeout(() => setSharedGuestId(null), 2000);
                }
            }
        } catch (err) {
            console.error('Error sharing:', err);
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(invitationText);
                setSharedGuestId(guest.id);
                setTimeout(() => setSharedGuestId(null), 2000);
            } catch (clipErr) {
                console.error('Clipboard fallback failed:', clipErr);
            }
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
                                        <span>{guest.phone || 'No phone'}</span>
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
                                    <button
                                        onClick={() => shareGuest(guest)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                                        title="Share invitation"
                                    >
                                        {sharedGuestId === guest.id ? (
                                            <><CheckCircle2 size={16} /> Shared!</>
                                        ) : (
                                            <><Share2 size={16} /> Share</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowQR(guest.id)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                                    >
                                        <QrCode size={16} /> QR
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
                                >
                                    <UserPlus size={16} /> Add to List
                                </button>
                                <button
                                    type="submit"
                                    onClick={(e) => handleAddGuest(e, true)}
                                    className="btn btn-primary"
                                    style={{ justifyContent: 'center' }}
                                >
                                    <Share2 size={16} /> Add & Invite
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
        </div>
    );
};

export default EventDetails;
