import React, { useState } from 'react';
import { Sparkles, Plus, X, Check, Trash2, Palette, Edit2 } from 'lucide-react';
import '../../pages/EventTabs.css';

const DecorationsTab = ({ event, onUpdateDecorations }) => {
    const [decorations, setDecorations] = useState(event.decorations || {
        theme: '',
        colorPalette: [],
        items: []
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        item: '',
        area: 'entrance',
        quantity: '',
        cost: '',
        status: 'planned'
    });

    const areas = [
        { id: 'entrance', label: 'Entrance', emoji: '🚪' },
        { id: 'stage', label: 'Stage/Main Area', emoji: '🎭' },
        { id: 'tables', label: 'Tables', emoji: '🪑' },
        { id: 'ceiling', label: 'Ceiling', emoji: '✨' },
        { id: 'walls', label: 'Walls', emoji: '🖼️' },
        { id: 'outdoor', label: 'Outdoor', emoji: '🌳' }
    ];

    const statuses = [
        { id: 'planned', label: 'Planned', color: 'var(--text-tertiary)' },
        { id: 'ordered', label: 'Ordered', color: 'var(--warning)' },
        { id: 'received', label: 'Received', color: 'var(--success)' }
    ];

    const handleAddItem = () => {
        if (!newItem.item) return;

        const item = {
            id: Date.now().toString(),
            ...newItem,
            quantity: parseInt(newItem.quantity) || 0,
            cost: parseFloat(newItem.cost) || 0
        };

        const updated = {
            ...decorations,
            items: [...(decorations.items || []), item]
        };

        setDecorations(updated);
        onUpdateDecorations?.(updated);
        setNewItem({ item: '', area: 'entrance', quantity: '', cost: '', status: 'planned' });
        setShowAddForm(false);
    };

    const handleDeleteItem = (id) => {
        if (!confirm('Delete this decoration item?')) return;
        const updated = {
            ...decorations,
            items: decorations.items.filter(item => item.id !== id)
        };
        setDecorations(updated);
        onUpdateDecorations?.(updated);
    };

    const handleUpdateStatus = (id, newStatus) => {
        const updated = {
            ...decorations,
            items: decorations.items.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            )
        };
        setDecorations(updated);
        onUpdateDecorations?.(updated);
    };

    const handleUpdateTheme = (theme, colors) => {
        const updated = {
            ...decorations,
            theme,
            colorPalette: colors
        };
        setDecorations(updated);
        onUpdateDecorations?.(updated);
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleUpdateItem = () => {
        if (!editingItem.item) return;

        const updated = {
            ...decorations,
            items: decorations.items.map(item =>
                item.id === editingItem.id ? {
                    ...editingItem,
                    quantity: parseInt(editingItem.quantity) || 0,
                    cost: parseFloat(editingItem.cost) || 0
                } : item
            )
        };
        setDecorations(updated);
        onUpdateDecorations?.(updated);
        setEditingItem(null);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const items = decorations.items || [];
    const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

    return (
        <div className="event-tab-page">
            {/* Stats */}
            <div className="tab-stats-grid">
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Sparkles size={14} color="var(--primary)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Items</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{items.length}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Cost</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>${totalCost.toLocaleString()}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Check size={14} color="#10b981" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Received</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>
                        {items.filter(i => i.status === 'received').length}
                    </span>
                </div>
            </div>

            {/* Theme Card */}
            <div className="hero-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: 8, background: 'var(--bg-primary)', borderRadius: '50%' }}>
                        <Palette size={20} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Theme & Colors</h3>
                </div>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Event Theme</label>
                    <input
                        type="text"
                        className="modern-input"
                        value={decorations.theme}
                        onChange={(e) => handleUpdateTheme(e.target.value, decorations.colorPalette)}
                        placeholder="e.g., Vintage Garden, Modern Elegance"
                        style={{ maxWidth: '100%', background: 'var(--bg-primary)' }}
                    />
                </div>
            </div>

            {/* List by Area */}
            {areas.map(area => {
                const areaItems = items.filter(item => item.area === area.id);
                if (areaItems.length === 0) return null;

                return (
                    <div key={area.id} style={{ marginBottom: 24 }}>
                        <div className="section-header" style={{ marginBottom: 12 }}>
                            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{area.emoji}</span>
                                {area.label}
                                <span className="category-pill" style={{ fontSize: 12 }}>{areaItems.length}</span>
                            </h3>
                        </div>
                        <div className="tab-list">
                            {areaItems.map(item => (
                                <div key={item.id} className="tab-list-item">
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Sparkles size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                            {item.item}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                                            <span>Qty: {item.quantity}</span>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${item.cost.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <select
                                            value={item.status}
                                            onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                                            className="status-select"
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: 20,
                                                border: '1px solid var(--border)',
                                                background: 'var(--bg-primary)',
                                                fontSize: 12,
                                                fontWeight: 500,
                                                color: statuses.find(s => s.id === item.status)?.color || 'var(--text-secondary)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {statuses.map(status => (
                                                <option key={status.id} value={status.id}>{status.label}</option>
                                            ))}
                                        </select>
                                        <div className="item-actions">
                                            <button onClick={() => handleEditItem(item)} className="action-btn">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="action-btn delete-btn">
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

            {items.length === 0 && (
                <div className="tab-empty-state">
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        color: 'var(--text-tertiary)'
                    }}>
                        <Sparkles size={32} />
                    </div>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>No Decorations Yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Start planning your decor.</p>
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
                            <h3 className="section-title">Add Decoration</h3>
                            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Item Name*</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={newItem.item}
                                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                                    placeholder="e.g., Balloons, Flowers"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Area</label>
                                <select className="modern-input" value={newItem.area} onChange={(e) => setNewItem({ ...newItem, area: e.target.value })}>
                                    {areas.map(area => <option key={area.id} value={area.id}>{area.emoji} {area.label}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Quantity</label>
                                    <input type="number" className="modern-input" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Cost ($)</label>
                                    <input type="number" step="0.01" className="modern-input" value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })} />
                                </div>
                            </div>
                            <button onClick={handleAddItem} className="btn-primary" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                                Add Item
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
                            <h3 className="section-title">Edit Decoration</h3>
                            <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Item Name</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={editingItem.item}
                                    onChange={(e) => setEditingItem({ ...editingItem, item: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Area</label>
                                <select className="modern-input" value={editingItem.area} onChange={(e) => setEditingItem({ ...editingItem, area: e.target.value })}>
                                    {areas.map(area => <option key={area.id} value={area.id}>{area.label}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Quantity</label>
                                    <input type="number" className="modern-input" value={editingItem.quantity} onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })} />
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

export default DecorationsTab;
