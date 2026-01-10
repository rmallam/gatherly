import React, { useState } from 'react';
import { UtensilsCrossed, Plus, X, Edit2, Check, Trash2 } from 'lucide-react';

const CateringTab = ({ event, onUpdateCatering }) => {
    const [menuItems, setMenuItems] = useState(event.catering?.items || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'appetizer',
        quantity: '',
        servings: '',
        cost: '',
        vendor: '',
        status: 'planned'
    });

    const categories = [
        { id: 'appetizer', label: 'Appetizers', emoji: '🥗' },
        { id: 'main', label: 'Main Course', emoji: '🍽️' },
        { id: 'dessert', label: 'Desserts', emoji: '🍰' },
        { id: 'beverage', label: 'Beverages', emoji: '🥤' },
        { id: 'other', label: 'Other', emoji: '🍴' }
    ];

    const statusOptions = [
        { id: 'planned', label: 'Planned', color: 'var(--text-tertiary)' },
        { id: 'ordered', label: 'Ordered', color: 'var(--warning)' },
        { id: 'confirmed', label: 'Confirmed', color: 'var(--success)' }
    ];

    const handleAddItem = () => {
        if (!newItem.name) return;

        const item = {
            id: Date.now().toString(),
            ...newItem,
            quantity: parseInt(newItem.quantity) || 0,
            servings: parseInt(newItem.servings) || 0,
            cost: parseFloat(newItem.cost) || 0
        };

        const updatedItems = [...menuItems, item];
        setMenuItems(updatedItems);
        onUpdateCatering?.(updatedItems);
        setNewItem({ name: '', category: 'appetizer', quantity: '', servings: '', cost: '', vendor: '', status: 'planned' });
        setShowAddForm(false);
    };

    const handleDeleteItem = (id) => {
        const updatedItems = menuItems.filter(item => item.id !== id);
        setMenuItems(updatedItems);
        onUpdateCatering?.(updatedItems);
    };

    const handleUpdateStatus = (id, newStatus) => {
        const updatedItems = menuItems.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        );
        setMenuItems(updatedItems);
        onUpdateCatering?.(updatedItems);
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleUpdateItem = () => {
        if (!editingItem.name) return;

        const updatedItems = menuItems.map(item =>
            item.id === editingItem.id ? {
                ...editingItem,
                quantity: parseInt(editingItem.quantity) || 0,
                servings: parseInt(editingItem.servings) || 0,
                cost: parseFloat(editingItem.cost) || 0
            } : item
        );
        setMenuItems(updatedItems);
        onUpdateCatering?.(updatedItems);
        setEditingItem(null);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const totalCost = menuItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const totalServings = menuItems.reduce((sum, item) => sum + (item.servings || 0), 0);
    const confirmedGuests = event.guests?.filter(g => g.rsvp === true).length || 0;

    return (
        <div>
            {/* Add Item Button */}
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary"
                style={{ marginBottom: '1.5rem' }}
            >
                <Plus size={16} /> Add Menu Item
            </button>

            {/* Add Form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>New Menu Item</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Item Name*</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="e.g., Caesar Salad"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Category</label>
                            <select className="form-input" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Quantity</label>
                            <input type="number" className="form-input" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Servings</label>
                            <input type="number" className="form-input" value={newItem.servings} onChange={(e) => setNewItem({ ...newItem, servings: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Cost ($)</label>
                            <input type="number" step="0.01" className="form-input" value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })} placeholder="0.00" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Vendor (Optional)</label>
                            <input type="text" className="form-input" value={newItem.vendor} onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })} placeholder="Vendor name" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleAddItem} className="btn btn-primary"><Check size={16} /> Add Item</button>
                        <button onClick={() => setShowAddForm(false)} className="btn btn-secondary"><X size={16} /> Cancel</button>
                    </div>
                </div>
            )}

            {/* Header Stats - Flat Design */}
            <div style={{ display: "grid", gridTemplateColumns: 'repeat(4, 1fr)', gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu Items</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{menuItems.length}</div>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Servings</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{totalServings}</div>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmed</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{confirmedGuests}</div>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>${totalCost.toFixed(2)}</div>
                </div>
            </div>

            {/* Menu Items by Category */}
            {categories.map(category => {
                const categoryItems = menuItems.filter(item => item.category === category.id);
                if (categoryItems.length === 0) return null;

                return (
                    <div key={category.id} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <span>{category.emoji}</span>
                            {category.label}
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-secondary)'
                            }}>{categoryItems.length}</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {categoryItems.map(item => (
                                <div key={item.id}
                                    style={{
                                        padding: '12px 0',
                                        transition: 'all 0.2s',
                                        borderRadius: '8px',
                                        paddingLeft: '8px',
                                        paddingRight: '8px',
                                        marginLeft: '-8px',
                                        marginRight: '-8px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    {editingItem?.id === item.id ? (
                                        // EDIT FORM
                                        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Edit Menu Item</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Item Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editingItem.name}
                                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Category</label>
                                                    <select
                                                        className="form-input"
                                                        value={editingItem.category}
                                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    >
                                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Quantity</label>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={editingItem.quantity}
                                                        onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Servings</label>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={editingItem.servings}
                                                        onChange={(e) => setEditingItem({ ...editingItem, servings: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Cost ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-input"
                                                        value={editingItem.cost}
                                                        onChange={(e) => setEditingItem({ ...editingItem, cost: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Vendor</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editingItem.vendor || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, vendor: e.target.value })}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button onClick={handleUpdateItem} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                                    <Check size={14} /> Save
                                                </button>
                                                <button onClick={handleCancelEdit} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // DISPLAY - Flat Design
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{item.name}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    <span>{item.quantity} items</span>
                                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-tertiary)' }}></span>
                                                    <span>{item.servings} servings</span>
                                                    {item.vendor && (
                                                        <>
                                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-tertiary)' }}></span>
                                                            <span>{item.vendor}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                                                    ${item.cost.toFixed(2)}
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            color: statusOptions.find(s => s.id === item.status)?.color,
                                                            cursor: 'pointer',
                                                            textAlign: 'right',
                                                            appearance: 'none', // Remove default arrow for cleaner look if desired, or keep it
                                                            paddingRight: '0'
                                                        }}
                                                    >
                                                        {statusOptions.map(status => (
                                                            <option key={status.id} value={status.id}>{status.label}</option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        className="action-btn"
                                                        style={{
                                                            padding: '0.5rem',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: 'var(--text-tertiary)',
                                                            cursor: 'pointer',
                                                            transition: 'color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                                        title="Edit item"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="action-btn"
                                                        style={{
                                                            padding: '0.5rem',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: 'var(--text-tertiary)',
                                                            cursor: 'pointer',
                                                            transition: 'color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
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
            {menuItems.length === 0 && !showAddForm && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        color: 'var(--text-tertiary)'
                    }}>
                        <UtensilsCrossed size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Menu Items Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                        Start planning your event menu by adding appetizers, main courses, and more.
                    </p>
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                        <Plus size={16} /> Add First Item
                    </button>
                </div>
            )}
        </div>
    );
};

export default CateringTab;
