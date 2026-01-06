import React, { useState } from 'react';
import { Gift, Plus, X, Check, Trash2, Edit2 } from 'lucide-react';

const GiftsTab = ({ event, onUpdateGifts }) => {
    const [gifts, setGifts] = useState(event.gifts?.items || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newGift, setNewGift] = useState({
        name: '',
        quantity: '',
        cost: '',
        personalization: '',
        status: 'planned'
    });

    const statuses = [
        { id: 'planned', label: 'Planned', color: 'var(--text-tertiary)' },
        { id: 'ordered', label: 'Ordered', color: 'var(--warning)' },
        { id: 'received', label: 'Received', color: 'var(--success)' },
        { id: 'distributed', label: 'Distributed', color: 'var(--primary)' }
    ];

    const totalGuests = event.guests?.length || 0;

    const handleAddGift = () => {
        if (!newGift.name) return;

        const gift = {
            id: Date.now().toString(),
            ...newGift,
            quantity: parseInt(newGift.quantity) || 0,
            cost: parseFloat(newGift.cost) || 0
        };

        const updatedGifts = [...gifts, gift];
        setGifts(updatedGifts);
        onUpdateGifts?.({ items: updatedGifts });
        setNewGift({ name: '', quantity: '', cost: '', personalization: '', status: 'planned' });
        setShowAddForm(false);
    };

    const handleDeleteGift = (id) => {
        const updatedGifts = gifts.filter(gift => gift.id !== id);
        setGifts(updatedGifts);
        onUpdateGifts?.({ items: updatedGifts });
    };

    const handleUpdateStatus = (id, newStatus) => {
        const updatedGifts = gifts.map(gift =>
            gift.id === id ? { ...gift, status: newStatus } : gift
        );
        setGifts(updatedGifts);
        onUpdateGifts?.({ items: updatedGifts });
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleUpdateItem = () => {
        if (!editingItem.name) return;

        const updatedGifts = gifts.map(gift =>
            gift.id === editingItem.id ? {
                ...editingItem,
                quantity: parseInt(editingItem.quantity) || 0,
                cost: parseFloat(editingItem.cost) || 0
            } : gift
        );
        setGifts(updatedGifts);
        onUpdateGifts?.({ items: updatedGifts });
        setEditingItem(null);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const totalCost = gifts.reduce((sum, gift) => sum + (gift.cost || 0), 0);
    const totalQuantity = gifts.reduce((sum, gift) => sum + (gift.quantity || 0), 0);

    return (
        <div>
            {/* Add Button */}
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ marginBottom: '1.5rem' }}>
                <Plus size={16} /> Add Gift Item
            </button>

            {/* Add Form */}
            {
                showAddForm && (
                    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>New Gift Item</h3>
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Gift Name*</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newGift.name}
                                    onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
                                    placeholder="e.g., Personalized Keychains"
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Quantity</label>
                                    <input type="number" className="form-input" value={newGift.quantity} onChange={(e) => setNewGift({ ...newGift, quantity: e.target.value })} placeholder={totalGuests ? `Suggested: ${totalGuests}` : "0"} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Cost per Item ($)</label>
                                    <input type="number" step="0.01" className="form-input" value={newGift.cost} onChange={(e) => setNewGift({ ...newGift, cost: e.target.value })} placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Personalization Notes (Optional)</label>
                                <input type="text" className="form-input" value={newGift.personalization} onChange={(e) => setNewGift({ ...newGift, personalization: e.target.value })} placeholder="e.g., Names engraved, Custom message" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleAddGift} className="btn btn-primary"><Check size={16} /> Add Gift</button>
                            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary"><X size={16} /> Cancel</button>
                        </div>
                    </div>
                )
            }

            {/* Stats */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
                <div className="card" style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Gift Types</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{gifts.length}</div>
                </div>
                <div className="card" style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Quantity</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{totalQuantity}</div>
                </div>
                <div className="card" style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Guests</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalGuests}</div>
                </div>
                <div className="card" style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Cost</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>${totalCost.toFixed(2)}</div>
                </div>
            </div>

            {/* Calculation Helper */}
            {
                totalGuests > 0 && totalQuantity < totalGuests && (
                    <div className="card" style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)', marginBottom: '1.5rem', background: '#fef3c7', borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 500 }}>
                            ⚠️ You need {totalGuests - totalQuantity} more gifts to cover all guests
                        </div>
                    </div>
                )
            }

            {/* Gift List */}
            {
                gifts.length > 0 && (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {gifts.map(gift => (
                            <div key={gift.id}>
                                {editingItem?.id === gift.id ? (
                                    // EDIT FORM
                                    <div className="card" style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Edit Gift</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Gift Name</label>
                                                <input type="text" className="form-input" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ padding: '0.5rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Quantity</label>
                                                <input type="number" className="form-input" value={editingItem.quantity} onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })} style={{ padding: '0.5rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Cost ($)</label>
                                                <input type="number" step="0.01" className="form-input" value={editingItem.cost} onChange={(e) => setEditingItem({ ...editingItem, cost: e.target.value })} style={{ padding: '0.5rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Recipient</label>
                                                <input type="text" className="form-input" value={editingItem.recipient || ''} onChange={(e) => setEditingItem({ ...editingItem, recipient: e.target.value })} style={{ padding: '0.5rem' }} />
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
                                    <div className="card" style={{ padding: '0.75rem', flex: 1, minWidth: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{gift.name}</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                                                    <span>Qty: {gift.quantity}</span>
                                                    <span>@ ${(gift.cost / gift.quantity || 0).toFixed(2)} each</span>
                                                    <span style={{ fontWeight: 600, color: 'var(--warning)' }}>Total: ${gift.cost.toFixed(2)}</span>
                                                </div>
                                                {gift.personalization && (
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                        {gift.personalization}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <select value={gift.status} onChange={(e) => handleUpdateStatus(gift.id, e.target.value)} style={{ padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: 500, color: statuses.find(s => s.id === gift.status)?.color, cursor: 'pointer' }}>
                                                    {statuses.map(status => (
                                                        <option key={status.id} value={status.id}>{status.label}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => handleEditItem(gift)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} title="Edit gift">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteGift(gift.id)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }

            {/* Empty State */}
            {
                gifts.length === 0 && !showAddForm && (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <Gift size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Gifts Yet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Add return gifts or party favors for your guests
                        </p>
                        <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                            <Plus size={16} /> Add First Gift
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default GiftsTab;
