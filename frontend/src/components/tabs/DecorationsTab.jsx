import React, { useState } from 'react';
import { Sparkles, Plus, X, Check, Trash2, Palette, Edit2 } from 'lucide-react';

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
        <div>
            {/* Add Button */}
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ marginBottom: '1.5rem' }}>
                <Plus size={16} /> Add Decoration Item
            </button>

            {/* Add Form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>New Decoration Item</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Item*</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newItem.item}
                                onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                                placeholder="e.g., Balloons, Flowers"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Area</label>
                            <select className="form-input" value={newItem.area} onChange={(e) => setNewItem({ ...newItem, area: e.target.value })}>
                                {areas.map(area => <option key={area.id} value={area.id}>{area.emoji} {area.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Quantity</label>
                            <input type="number" className="form-input" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Cost ($)</label>
                            <input type="number" step="0.01" className="form-input" value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })} placeholder="0.00" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleAddItem} className="btn btn-primary"><Check size={16} /> Add Item</button>
                        <button onClick={() => setShowAddForm(false)} className="btn btn-secondary"><X size={16} /> Cancel</button>
                    </div>
                </div>
            )}

            {/* Theme & Colors */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={20} style={{ color: 'var(--primary)' }} />
                    Theme & Color Palette
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Theme Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={decorations.theme}
                            onChange={(e) => handleUpdateTheme(e.target.value, decorations.colorPalette)}
                            placeholder="e.g., Vintage Garden, Modern Elegance"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Items</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{items.length}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Cost</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>${totalCost.toFixed(2)}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Received</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
                        {items.filter(i => i.status === 'received').length}
                    </div>
                </div>
            </div>


            {/* Items by Area */}
            {areas.map(area => {
                const areaItems = items.filter(item => item.area === area.id);
                if (areaItems.length === 0) return null;

                return (
                    <div key={area.id} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{area.emoji}</span>
                            {area.label}
                            <span className="badge badge-primary">{areaItems.length}</span>
                        </h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {areaItems.map(item => (
                                <div key={item.id}>
                                    {editingItem?.id === item.id ? (
                                        // EDIT FORM
                                        <div className="card" style={{ padding: '1rem' }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Edit Decoration</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Item</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editingItem.item}
                                                        onChange={(e) => setEditingItem({ ...editingItem, item: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Area</label>
                                                    <select
                                                        className="form-input"
                                                        value={editingItem.area}
                                                        onChange={(e) => setEditingItem({ ...editingItem, area: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    >
                                                        {areas.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Quantity</label>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={editingItem.quantity}
                                                        onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Cost ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-input"
                                                        value={editingItem.cost}
                                                        onChange={(e) => setEditingItem({ ...editingItem, cost: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={handleUpdateItem} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                                    <Check size={14} /> Save
                                                </button>
                                                <button onClick={handleCancelEdit} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // DISPLAY
                                        <div className="card" style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.item}</h4>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                        <span>Qty: {item.quantity}</span>
                                                        <span style={{ fontWeight: 600, color: 'var(--warning)' }}>${item.cost.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                                                        style={{
                                                            padding: '0.375rem 0.75rem',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: '1px solid var(--border)',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500,
                                                            color: statuses.find(s => s.id === item.status)?.color,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {statuses.map(status => (
                                                            <option key={status.id} value={status.id}>{status.label}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        style={{
                                                            padding: '0.5rem',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: 'var(--primary)',
                                                            cursor: 'pointer',
                                                            borderRadius: 'var(--radius-md)'
                                                        }}
                                                        title="Edit item"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
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
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Empty State */}
            {items.length === 0 && !showAddForm && (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Sparkles size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Decorations Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Start planning your decor by adding items
                    </p>
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                        <Plus size={16} /> Add First Item
                    </button>
                </div>
            )}
        </div>
    );
};

export default DecorationsTab;
