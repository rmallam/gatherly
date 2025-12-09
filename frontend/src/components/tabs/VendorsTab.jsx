import React, { useState } from 'react';
import { Briefcase, Plus, X, Check, Trash2, Phone, Mail } from 'lucide-react';

const VendorsTab = ({ event, onUpdateVendors }) => {
    const [vendors, setVendors] = useState(event.vendors || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '',
        category: 'other',
        contact: '',
        phone: '',
        email: '',
        cost: '',
        status: 'contacted',
        notes: ''
    });

    const categories = [
        { id: 'photography', label: 'Photography', emoji: '📷' },
        { id: 'catering', label: 'Catering', emoji: '🍽️' },
        { id: 'entertainment', label: 'Entertainment', emoji: '🎵' },
        { id: 'decoration', label: 'Decoration', emoji: '🎨' },
        { id: 'venue', label: 'Venue', emoji: '🏛️' },
        { id: 'transport', label: 'Transportation', emoji: '🚗' },
        { id: 'other', label: 'Other', emoji: '📋' }
    ];

    const statuses = [
        { id: 'contacted', label: 'Contacted', color: 'var(--text-tertiary)' },
        { id: 'quoted', label: 'Quoted', color: 'var(--warning)' },
        { id: 'booked', label: 'Booked', color: 'var(--success)' },
        { id: 'paid', label: 'Paid', color: 'var(--primary)' }
    ];

    const handleAddVendor = () => {
        if (!newVendor.name) return;

        const vendor = {
            id: Date.now().toString(),
            ...newVendor,
            cost: parseFloat(newVendor.cost) || 0
        };

        const updatedVendors = [...vendors, vendor];
        setVendors(updatedVendors);
        onUpdateVendors?.(updatedVendors);
        setNewVendor({ name: '', category: 'other', contact: '', phone: '', email: '', cost: '', status: 'contacted', notes: '' });
        setShowAddForm(false);
    };

    const handleDeleteVendor = (id) => {
        const updatedVendors = vendors.filter(v => v.id !== id);
        setVendors(updatedVendors);
        onUpdateVendors?.(updatedVendors);
    };

    const handleUpdateStatus = (id, newStatus) => {
        const updatedVendors = vendors.map(vendor =>
            vendor.id === id ? { ...vendor, status: newStatus } : vendor
        );
        setVendors(updatedVendors);
        onUpdateVendors?.(updatedVendors);
    };

    const totalCost = vendors.reduce((sum, v) => sum + (v.cost || 0), 0);
    const bookedVendors = vendors.filter(v => v.status === 'booked' || v.status === 'paid').length;

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Vendors</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{vendors.length}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Booked</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{bookedVendors}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Cost</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>${totalCost.toFixed(2)}</div>
                </div>
            </div>

            {/* Add Button */}
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ marginBottom: '1.5rem' }}>
                <Plus size={16} /> Add Vendor
            </button>

            {/* Add Form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>New Vendor</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Vendor Name*</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newVendor.name}
                                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                    placeholder="Company or person name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Category</label>
                                <select
                                    className="form-input"
                                    value={newVendor.category}
                                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Contact Person</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newVendor.contact}
                                    onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={newVendor.phone}
                                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newVendor.email}
                                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Cost ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={newVendor.cost}
                                    onChange={(e) => setNewVendor({ ...newVendor, cost: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Notes (Optional)</label>
                            <textarea
                                className="form-input"
                                value={newVendor.notes}
                                onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                                placeholder="Contract details, special requirements, etc."
                                rows={2}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleAddVendor} className="btn btn-primary">
                            <Check size={16} /> Add Vendor
                        </button>
                        <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Vendors by Category */}
            {categories.map(category => {
                const categoryVendors = vendors.filter(v => v.category === category.id);
                if (categoryVendors.length === 0) return null;

                return (
                    <div key={category.id} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{category.emoji}</span>
                            {category.label}
                            <span className="badge badge-primary">{categoryVendors.length}</span>
                        </h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {categoryVendors.map(vendor => (
                                <div key={vendor.id} className="card" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{vendor.name}</h4>
                                            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                {vendor.contact && <div>👤 {vendor.contact}</div>}
                                                {vendor.phone && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Phone size={14} />
                                                        <a href={`tel:${vendor.phone}`} style={{ color: 'var(--primary)' }}>{vendor.phone}</a>
                                                    </div>
                                                )}
                                                {vendor.email && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Mail size={14} />
                                                        <a href={`mailto:${vendor.email}`} style={{ color: 'var(--primary)' }}>{vendor.email}</a>
                                                    </div>
                                                )}
                                                {vendor.cost > 0 && (
                                                    <div style={{ fontWeight: 600, color: 'var(--warning)', marginTop: '0.25rem' }}>
                                                        Cost: ${vendor.cost.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                            {vendor.notes && (
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                                    {vendor.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <select
                                                value={vendor.status}
                                                onChange={(e) => handleUpdateStatus(vendor.id, e.target.value)}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--border)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: statuses.find(s => s.id === vendor.status)?.color,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {statuses.map(status => (
                                                    <option key={status.id} value={status.id}>{status.label}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleDeleteVendor(vendor.id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: 'var(--error)',
                                                    cursor: 'pointer',
                                                    borderRadius: 'var(--radius-md)'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Empty State */}
            {vendors.length === 0 && !showAddForm && (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Briefcase size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Vendors Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Build your vendor directory to manage all event suppliers
                    </p>
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                        <Plus size={16} /> Add First Vendor
                    </button>
                </div>
            )}
        </div>
    );
};

export default VendorsTab;
