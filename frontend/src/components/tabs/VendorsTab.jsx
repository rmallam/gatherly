import React, { useState } from 'react';
import { Briefcase, Plus, X, Check, Trash2, Phone, Mail, Edit2 } from 'lucide-react';
import '../../pages/EventTabs.css';

const VendorsTab = ({ event, onUpdateVendors }) => {
    const [vendors, setVendors] = useState(event.vendors || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
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
        if (!confirm('Delete this vendor?')) return;
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

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleUpdateItem = () => {
        if (!editingItem.name) return;

        const updatedVendors = vendors.map(vendor =>
            vendor.id === editingItem.id ? {
                ...editingItem,
                cost: parseFloat(editingItem.cost) || 0
            } : vendor
        );
        setVendors(updatedVendors);
        onUpdateVendors?.(updatedVendors);
        setEditingItem(null);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const totalCost = vendors.reduce((sum, v) => sum + (v.cost || 0), 0);
    const bookedVendors = vendors.filter(v => v.status === 'booked' || v.status === 'paid').length;

    return (
        <div className="event-tab-page">
            {/* Stats */}
            <div className="tab-stats-grid">
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Briefcase size={14} color="var(--primary)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Vendors</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{vendors.length}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Check size={14} color="#10b981" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Booked</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{bookedVendors}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Cost</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>${totalCost.toLocaleString()}</span>
                </div>
            </div>

            {/* List by Category */}
            {categories.map(category => {
                const categoryVendors = vendors.filter(v => v.category === category.id);
                if (categoryVendors.length === 0) return null;

                return (
                    <div key={category.id} style={{ marginBottom: 24 }}>
                        <div className="section-header" style={{ marginBottom: 12 }}>
                            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{category.emoji}</span>
                                {category.label}
                                <span className="category-pill" style={{ fontSize: 12 }}>{categoryVendors.length}</span>
                            </h3>
                        </div>
                        <div className="tab-list">
                            {categoryVendors.map(vendor => (
                                <div key={vendor.id} className="tab-list-item">
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Briefcase size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                            {vendor.name}
                                        </div>
                                        <div style={{ display: 'grid', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {vendor.contact && <div>👤 {vendor.contact}</div>}
                                            {vendor.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Phone size={14} />
                                                    <a href={`tel:${vendor.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{vendor.phone}</a>
                                                </div>
                                            )}
                                            {vendor.email && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Mail size={14} />
                                                    <a href={`mailto:${vendor.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{vendor.email}</a>
                                                </div>
                                            )}
                                            {vendor.cost > 0 && (
                                                <div style={{ fontWeight: 600, color: '#f59e0b', marginTop: 4 }}>
                                                    Cost: ${vendor.cost.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                        {vendor.notes && (
                                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 8 }}>
                                                {vendor.notes}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <select
                                            value={vendor.status}
                                            onChange={(e) => handleUpdateStatus(vendor.id, e.target.value)}
                                            className="status-select"
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: 20,
                                                border: '1px solid var(--border)',
                                                background: 'var(--bg-primary)',
                                                fontSize: 12,
                                                fontWeight: 500,
                                                color: statuses.find(s => s.id === vendor.status)?.color || 'var(--text-secondary)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {statuses.map(status => (
                                                <option key={status.id} value={status.id}>{status.label}</option>
                                            ))}
                                        </select>
                                        <div className="item-actions">
                                            <button onClick={() => handleEditItem(vendor)} className="action-btn">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteVendor(vendor.id)} className="action-btn delete-btn">
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

            {vendors.length === 0 && (
                <div className="tab-empty-state">
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        color: 'var(--text-tertiary)'
                    }}>
                        <Briefcase size={32} />
                    </div>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>No Vendors Yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Build your vendor directory.</p>
                </div>
            )}

            <div style={{ height: 80 }} />

            {/* FAB */}
            <button className="btn-floating-action" onClick={() => setShowAddForm(true)}>
                <Plus size={24} />
            </button>

            {/* Add Modal */}
            {showAddForm && (
                <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="section-header">
                            <h3 className="section-title">Add Vendor</h3>
                            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Vendor Name*</label>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        value={newVendor.name}
                                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                        placeholder="Company name"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Category</label>
                                    <select className="modern-input" value={newVendor.category} onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Contact Person</label>
                                    <input type="text" className="modern-input" value={newVendor.contact} onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Phone</label>
                                    <input type="tel" className="modern-input" value={newVendor.phone} onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
                                    <input type="email" className="modern-input" value={newVendor.email} onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Cost ($)</label>
                                    <input type="number" step="0.01" className="modern-input" value={newVendor.cost} onChange={(e) => setNewVendor({ ...newVendor, cost: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Notes</label>
                                <textarea className="modern-input" value={newVendor.notes} onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })} placeholder="Contract details..." rows={2} style={{ minHeight: 60 }} />
                            </div>
                            <button onClick={handleAddVendor} className="btn-primary" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                                Add Vendor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="modal-overlay" onClick={handleCancelEdit}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="section-header">
                            <h3 className="section-title">Edit Vendor</h3>
                            <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Name</label>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Category</label>
                                    <select className="modern-input" value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Contact</label>
                                    <input type="text" className="modern-input" value={editingItem.contact || ''} onChange={(e) => setEditingItem({ ...editingItem, contact: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Phone</label>
                                    <input type="tel" className="modern-input" value={editingItem.phone || ''} onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
                                    <input type="email" className="modern-input" value={editingItem.email || ''} onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Cost ($)</label>
                                    <input type="number" step="0.01" className="modern-input" value={editingItem.cost} onChange={(e) => setEditingItem({ ...editingItem, cost: e.target.value })} />
                                </div>
                            </div>
                            <button onClick={handleUpdateItem} className="btn-primary" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorsTab;
