import React, { useState } from 'react';
import { MapPin, Save, X, Check, Building2, Sparkles, Loader2 } from 'lucide-react';
import LocationAutocomplete from '../common/LocationAutocomplete';
import { formatCurrency, getCurrencySymbol } from '../../utils/currencyUtils';
import CategoryTourWrapper from '../tours/CategoryTourWrapper';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const VenueTab = ({ event, onUpdateVenue }) => {
    const { API_URL } = useApp();
    const { user } = useAuth();
    const initialVenue = event.venue || {};
    const [venue, setVenue] = useState({
        name: '',
        contact: '',
        phone: '',
        capacity: '',
        setupTime: '',
        eventTime: '',
        teardownTime: '',
        bookingStatus: 'not-booked',
        deposit: '',
        totalCost: '',
        notes: '',
        amenities: [],
        ...initialVenue,
        address: initialVenue.address || event.location || ''
    });

    const [isEditing, setIsEditing] = useState(!event.venue?.name);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const bookingStatuses = [
        { id: 'not-booked', label: 'Not Booked', color: 'var(--text-tertiary)' },
        { id: 'pending', label: 'Pending', color: 'var(--warning)' },
        { id: 'deposit-paid', label: 'Deposit Paid', color: 'var(--primary)' },
        { id: 'confirmed', label: 'Confirmed', color: 'var(--success)' }
    ];

    const availableAmenities = [
        'Parking', 'Wheelchair Accessible', 'WiFi', 'Sound System',
        'Projector/Screen', 'Kitchen', 'Bar', 'Dance Floor',
        'Outdoor Space', 'Air Conditioning', 'Heating', 'Tables & Chairs'
    ];

    const handleSave = (e) => {
        if (e) e.preventDefault();
        onUpdateVenue?.(venue);
        setIsEditing(false);
    };

    const handleCancel = (e) => {
        if (e) e.preventDefault();
        if (event.venue) {
            setVenue(event.venue);
            setIsEditing(false);
        }
    };

    const toggleAmenity = (amenity) => {
        const amenities = venue.amenities || [];
        if (amenities.includes(amenity)) {
            setVenue({ ...venue, amenities: amenities.filter(a => a !== amenity) });
        } else {
            setVenue({ ...venue, amenities: [...amenities, amenity] });
        }
    };

    const handleAutoFillAI = async (e) => {
        if (e) e.preventDefault();
        const queryStr = venue.address || venue.name || event.location;
        if (!queryStr) {
            alert('Please enter a venue name or address first, so AI knows what to search for.');
            return;
        }

        try {
            setIsAiLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/ai/venue-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ location: queryStr })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to fetch AI venue details');
            }

            const data = await res.json();
            if (data.venue) {
                setVenue(prev => ({
                    ...prev,
                    name: data.venue.name || prev.name,
                    address: data.venue.address || prev.address,
                    capacity: data.venue.capacity || prev.capacity,
                    phone: data.venue.phone || prev.phone,
                    contact: data.venue.contact || prev.contact,
                    notes: data.venue.notes ? (prev.notes ? prev.notes + '\\n\\nAI Notes: ' + data.venue.notes : data.venue.notes) : prev.notes,
                    amenities: data.venue.amenities && Array.isArray(data.venue.amenities) 
                        ? [...new Set([...(prev.amenities || []), ...data.venue.amenities])]
                        : prev.amenities
                }));
            }
        } catch (error) {
            console.error('AI Auto-fill Error:', error);
            alert(error.message);
        } finally {
            setIsAiLoading(false);
        }
    };

    const hasVenue = venue.name || event.venue?.name;

    if (!hasVenue && !isEditing) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                <Building2 size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Venue Yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Add your venue details to keep track of location and booking information
                </p>
                <button type="button" onClick={() => setIsEditing(true)} className="btn btn-primary">
                    Add Venue Information
                </button>
            </div>
        );
    }

    return (
        <div>
            <CategoryTourWrapper
                tabId="venue"
                steps={[
                    {
                        target: '.tour-venue-form',
                        content: 'Search for any global location to automatically parse address details, or enter it manually!',
                        placement: 'bottom',
                        disableBeacon: true,
                    }
                ]}
            />
            {hasVenue && !isEditing ? (
                <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{venue.name}</h2>
                        <button type="button" onClick={() => setIsEditing(true)} className="btn btn-secondary">
                            Edit Venue Details
                        </button>
                    </div>

                    {/* View Mode Content */}
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Booking Status Card */}
                        <div style={{ padding: '1.5rem', borderRadius: '16px', background: `linear-gradient(135deg, ${bookingStatuses.find(s => s.id === venue.bookingStatus)?.color || 'var(--primary)'} 0%, var(--primary-dark) 100%)`, color: 'white' }}>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Booking Status</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {bookingStatuses.find(s => s.id === venue.bookingStatus)?.label}
                            </div>
                        </div>

                        {/* Contact & Location */}
                        <div style={{ padding: '0 0.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={20} style={{ color: 'var(--primary)' }} />
                                Location & Contact
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {venue.address && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Address</div>
                                        <a 
                                            href={`https://maps.google.com/?q=${encodeURIComponent(venue.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '1rem', color: 'var(--primary)', textDecoration: 'none' }}
                                        >
                                            {venue.address}
                                        </a>
                                    </div>
                                )}
                                {venue.contact && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Contact Person</div>
                                        <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{venue.contact}</div>
                                    </div>
                                )}
                                {venue.phone && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Phone</div>
                                        <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{venue.phone}</div>
                                    </div>
                                )}
                                {venue.capacity && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Capacity</div>
                                        <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{venue.capacity} guests</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schedule */}
                        {(venue.setupTime || venue.eventTime || venue.teardownTime) && (
                            <div style={{ padding: '0 0.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Schedule</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {venue.setupTime && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Setup Time</div>
                                            <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{venue.setupTime}</div>
                                        </div>
                                    )}
                                    {venue.eventTime && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Event Time</div>
                                            <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{venue.eventTime}</div>
                                        </div>
                                    )}
                                    {venue.teardownTime && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Teardown Time</div>
                                            <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{venue.teardownTime}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Costs */}
                        {(venue.deposit || venue.totalCost) && (
                            <div style={{ padding: '0 0.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Costs</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {venue.deposit && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Deposit Paid</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{formatCurrency(venue.deposit, event.country)}</div>
                                        </div>
                                    )}
                                    {venue.totalCost && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Cost</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(venue.totalCost, event.country)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Amenities */}
                        {venue.amenities && venue.amenities.length > 0 && (
                            <div style={{ padding: '0 0.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Amenities</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {venue.amenities.map(amenity => (
                                        <span key={amenity} className="badge badge-primary">{amenity}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {venue.notes && (
                            <div style={{ padding: '0 0.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Notes</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{venue.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Edit Mode */
                <div className="tour-venue-form" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                            {hasVenue ? 'Edit Venue Details' : 'Add Venue Information'}
                        </h3>
                        {user?.subscription_tier === 'pro' && (
                            <button 
                                type="button"
                                onClick={handleAutoFillAI} 
                                disabled={isAiLoading}
                                className="btn"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                                    color: 'var(--primary)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {isAiLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                                {isAiLoading ? 'Filling Details...' : 'Auto-fill with AI (Pro)'}
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Basic Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Venue Name*</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={venue.name}
                                    onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                                    placeholder="e.g., Grand Ballroom Hotel"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Capacity</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={venue.capacity}
                                    onChange={(e) => setVenue({ ...venue, capacity: e.target.value })}
                                    placeholder="e.g., 200"
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Address</label>
                            <LocationAutocomplete
                                value={venue.address}
                                onChange={(val) => setVenue({ ...venue, address: val })}
                                onSelect={(place) => {
                                    setVenue({
                                        ...venue,
                                        address: place.formatted_address || place.name,
                                        // We could also store place.place_id or geometry if needed in the future
                                    });
                                }}
                                placeholder="Full venue address"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Contact Person</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={venue.contact}
                                    onChange={(e) => setVenue({ ...venue, contact: e.target.value })}
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={venue.phone}
                                    onChange={(e) => setVenue({ ...venue, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        {/* Schedule */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Setup Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={venue.setupTime}
                                    onChange={(e) => setVenue({ ...venue, setupTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Event Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={venue.eventTime}
                                    onChange={(e) => setVenue({ ...venue, eventTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Teardown Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={venue.teardownTime}
                                    onChange={(e) => setVenue({ ...venue, teardownTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Costs & Status */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Booking Status</label>
                                <select
                                    className="form-input"
                                    value={venue.bookingStatus}
                                    onChange={(e) => setVenue({ ...venue, bookingStatus: e.target.value })}
                                >
                                    {bookingStatuses.map(status => (
                                        <option key={status.id} value={status.id}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Deposit Paid ({getCurrencySymbol(event.country)})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={venue.deposit}
                                    onChange={(e) => setVenue({ ...venue, deposit: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Total Cost ({getCurrencySymbol(event.country)})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={venue.totalCost}
                                    onChange={(e) => setVenue({ ...venue, totalCost: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>Amenities</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                                {availableAmenities.map(amenity => (
                                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: (venue.amenities || []).includes(amenity) ? 'var(--bg-tertiary)' : 'transparent' }}>
                                        <input
                                            type="checkbox"
                                            checked={(venue.amenities || []).includes(amenity)}
                                            onChange={() => toggleAmenity(amenity)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.875rem' }}>{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Notes</label>
                            <textarea
                                className="form-input"
                                value={venue.notes}
                                onChange={(e) => setVenue({ ...venue, notes: e.target.value })}
                                placeholder="Any special requirements, restrictions, or important details..."
                                rows={4}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <button type="button" onClick={handleSave} className="btn btn-primary" disabled={!venue.name}>
                                <Save size={16} /> Save Venue Details
                            </button>
                            {hasVenue && (
                                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                    <X size={16} /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenueTab;
