import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import QRGenerator from '../components/QRGenerator';
import BulkImport from '../components/BulkImport';
import ContactPicker from '../components/ContactPicker';
import ContactSelector from '../components/ContactSelector';
import Analytics from '../components/Analytics';
import { exportAllGuests, exportCheckedInGuests } from '../utils/csvExport';
import { UserPlus, QrCode, Search, CheckCircle2, MapPin, Calendar, ArrowLeft, Users, Upload, Smartphone, Download, Share2, Copy, Check } from 'lucide-react';

const EventDetails = () => {
    const { id } = useParams();
    const { getEvent, addGuest, addBulkGuests, saveGuestToContacts } = useApp();
    const event = getEvent(id);

    const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
    const [search, setSearch] = useState('');
    const [showQR, setShowQR] = useState(null);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [showContactPicker, setShowContactPicker] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

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

    const handleAddGuest = (e) => {
        e.preventDefault();
        if (!newGuest.name) return;
        addGuest(id, newGuest);
        setNewGuest({ name: '', phone: '' });
    };

    const handleBulkImport = (contacts) => {
        addBulkGuests(id, contacts);
    };

    const handleSelectContacts = (selectedContacts) => {
        const guests = selectedContacts.map(contact => ({
            name: contact.name,
            phone: contact.phone,
            email: contact.email || ''
        }));
        addBulkGuests(id, guests);
    };

    const copyInvitationLink = () => {
        const link = `${window.location.origin}/invite/${id}`;
        navigator.clipboard.writeText(link).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };

    const filteredGuests = event.guests?.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.phone.includes(search)
    ).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)) || [];

    return (
        <div style={{ maxWidth: '75rem', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <Link to="/manager" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>
                    <ArrowLeft size={16} /> Back to Events
                </Link>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem' }}>
                    <div>
                        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Active Event</span>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            {event.title}
                        </h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={16} />
                                {event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
                            </span>
                            {event.location && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} />
                                    {event.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {event.guests?.length || 0}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                                Total Guests
                            </div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                                {event.guests?.filter(g => g.attended).length || 0}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                                Checked In
                            </div>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <button
                            onClick={() => exportAllGuests(event)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.875rem' }}
                        >
                            <Download size={16} /> Export All
                        </button>
                        <button
                            onClick={() => exportCheckedInGuests(event)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.875rem' }}
                            disabled={!event.guests?.some(g => g.attended)}
                        >
                            <Download size={16} /> Export Checked-In
                        </button>
                    </div>
                </div>
            </div>

            {/* RSVP Status */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    📋 RSVP Status (Before Event)
                </h3>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                            {event.guests?.filter(g => g.rsvp === true).length || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                            Confirmed
                        </div>
                    </div>
                    <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
                            {event.guests?.filter(g => g.rsvp === false).length || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                            Declined
                        </div>
                    </div>
                    <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#94a3b8' }}>
                            {event.guests?.filter(g => g.rsvp === undefined || g.rsvp === null).length || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                            No Response
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Day */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    🎫 Event Day (At Venue)
                </h3>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                            {event.guests?.filter(g => g.attended).length || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                            Checked In
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <Analytics event={event} />

            {/* Invitation Sharing */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    💌 Share Invitation
                </h3>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Public Invitation Link</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Share this link with guests so they can view event details and RSVP without logging in
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <code style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                            }}>
                                {window.location.origin}/invite/{id}
                            </code>
                            <button
                                onClick={copyInvitationLink}
                                className="btn btn-primary"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                {linkCopied ? (
                                    <><Check size={16} /> Copied!</>
                                ) : (
                                    <><Copy size={16} /> Copy Link</>
                                )}
                            </button>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        💡 Tip: Share this link via WhatsApp, SMS, email, or social media to collect RSVPs easily
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2rem', alignItems: 'start' }}>
                {/* Add Guest Form */}
                <div className="card" style={{ position: window.innerWidth >= 1024 ? 'sticky' : 'relative', top: window.innerWidth >= 1024 ? '5rem' : 'auto' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} style={{ color: 'var(--primary)' }} />
                        Add Guest
                    </h3>
                    <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                            <input
                                type="text"
                                className="input"
                                value={newGuest.name}
                                onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                                placeholder="John Doe"
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
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                            Add to List
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Import</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setShowContactSelector(true)}
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <Users size={16} /> Add from Contacts
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowBulkImport(true)}
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <Upload size={16} /> Import from CSV
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowContactPicker(true)}
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <Smartphone size={16} /> Import from Phone
                            </button>
                        </div>
                    </div>
                </div >

                {/* Guest List */}
                < div style={{ gridColumn: window.innerWidth >= 1024 ? 'span 2' : 'span 1' }}>
                    {/* Search */}
                    < div style={{ marginBottom: '1.5rem' }}>
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
                    </div >

                    {/* Guest Cards */}
                    {
                        filteredGuests.length === 0 ? (
                            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                <Users size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {search ? 'No guests found matching your search.' : 'No guests added yet.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {filteredGuests.map(guest => (
                                    <div key={guest.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                            <div className={`status - dot ${guest.attended ? 'status-dot-success' : 'status-dot-inactive'} `}></div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                    {guest.name}
                                                </h4>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    <span>{guest.phone || 'No phone'}</span>
                                                    {guest.attended && (
                                                        <span className="badge badge-success">
                                                            <CheckCircle2 size={12} /> Checked in (+{guest.attendedCount})
                                                        </span>
                                                    )}
                                                    {/* RSVP Status Badge */}
                                                    {guest.rsvp === true && (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            color: '#059669',
                                                            background: '#d1fae5',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.375rem'
                                                        }}>
                                                            <CheckCircle2 size={11} /> Confirmed
                                                        </span>
                                                    )}
                                                    {guest.rsvp === false && (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            color: '#dc2626',
                                                            background: '#fee2e2',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.375rem'
                                                        }}>
                                                            ✕ Declined
                                                        </span>
                                                    )}
                                                    {(guest.rsvp === undefined || guest.rsvp === null) && (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            color: '#64748b',
                                                            background: '#f1f5f9',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.375rem'
                                                        }}>
                                                            ━ Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowQR(guest.id)}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                        >
                                            <QrCode size={16} /> View QR
                                        </button>

                                        {showQR === guest.id && (
                                            <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={() => setShowQR(null)}>
                                                <div onClick={e => e.stopPropagation()}>
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
                        )
                    }
                </div >
            </div >

            {/* Bulk Import Modal */}
            {
                showBulkImport && (
                    <BulkImport
                        onImport={handleBulkImport}
                        onClose={() => setShowBulkImport(false)}
                    />
                )
            }

            {/* Contact Picker Modal */}
            {
                showContactPicker && (
                    <ContactPicker
                        onImport={handleBulkImport}
                        onClose={() => setShowContactPicker(false)}
                    />
                )
            }

            {/* Contact Selector Modal */}
            {
                showContactSelector && (
                    <ContactSelector
                        isOpen={showContactSelector}
                        onClose={() => setShowContactSelector(false)}
                        onSelectContacts={handleSelectContacts}
                    />
                )
            }

            {/* QR Generator Modal */}
            {showQR && (
                <QRGenerator
                    guest={showQR}
                    eventId={id}
                    eventTitle={event.title}
                    onClose={() => setShowQR(null)}
                />
            )}
        </div >
    );
};

export default EventDetails;
