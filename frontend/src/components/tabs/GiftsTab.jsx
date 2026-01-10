import React, { useState } from 'react';
import { Gift, Plus, X, Check, Trash2, Edit2 } from 'lucide-react';
import '../../pages/EventTabs.css';

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
        if (!confirm('Delete this gift?')) return;
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
        <div className="event-tab-page">
            {/* Stats */}
            <div className="tab-stats-grid">
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Gift size={14} color="var(--primary)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Types</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{gifts.length}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Check size={14} color="#10b981" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Qty</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{totalQuantity}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Cost</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>${totalCost.toLocaleString()}</span>
                </div>
            </div>

            {/* Warning Banner */}
            {totalGuests > 0 && totalQuantity < totalGuests && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderLeft: '4px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <span style={{ fontSize: 14, color: '#b45309', fontWeight: 500 }}>
                        Short by {totalGuests - totalQuantity} gifts for {totalGuests} guests.
                    </span>
                </div>
            )}

            {/* Gift List */}
            {gifts.length > 0 ? (
                <div className="tab-list">
                    {gifts.map(gift => (
                        <div key={gift.id} className="tab-list-item">
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Gift size={20} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    {gift.name}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                                    <span>Qty: {gift.quantity}</span>
                                    <span>${(gift.cost / (gift.quantity || 1)).toFixed(2)} ea</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Total: ${gift.cost.toFixed(2)}</span>
                                </div>
                                {gift.personalization && (
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 4 }}>
                                        "{gift.personalization}"
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <select
                                    value={gift.status}
                                    onChange={(e) => handleUpdateStatus(gift.id, e.target.value)}
                                    className="status-select"
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 20,
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-primary)',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: statuses.find(s => s.id === gift.status)?.color || 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {statuses.map(status => (
                                        <option key={status.id} value={status.id}>{status.label}</option>
                                    ))}
                                </select>

                                <div className="item-actions">
                                    <button onClick={() => handleEditItem(gift)} className="action-btn">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteGift(gift.id)} className="action-btn delete-btn">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div style={{ height: 80 }} />
                </div>
            ) : (
                <div className="tab-empty-state">
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        color: 'var(--text-tertiary)'
                    }}>
                        <Gift size={32} />
                    </div>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>No Gifts Yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Add return gifts or party favors.</p>
                </div>
            )}

            {/* FAB */}
            <button className="btn-floating-action" onClick={() => setShowAddForm(true)}>
                <Plus size={24} />
            </button>

            {/* Add Modal */}
            {showAddForm && (
                <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="section-header">
                            <h3 className="section-title">Add Gift Item</h3>
                            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Gift Name*</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={newGift.name}
                                    onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
                                    placeholder="e.g., Personalized Keychains"
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Quantity</label>
                                    <input type="number" className="modern-input" value={newGift.quantity} onChange={(e) => setNewGift({ ...newGift, quantity: e.target.value })} placeholder={totalGuests || "0"} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Total Cost ($)</label>
                                    <input type="number" step="0.01" className="modern-input" value={newGift.cost} onChange={(e) => setNewGift({ ...newGift, cost: e.target.value })} placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Personalization (Optional)</label>
                                <input type="text" className="modern-input" value={newGift.personalization} onChange={(e) => setNewGift({ ...newGift, personalization: e.target.value })} placeholder="e.g., Names engraved" />
                            </div>
                            <button onClick={handleAddGift} className="btn-primary" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                                Add Gift
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
                            <h3 className="section-title">Edit Gift</h3>
                            <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Gift Name</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Quantity</label>
                                    <input type="number" className="modern-input" value={editingItem.quantity} onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Total Cost ($)</label>
                                    <input type="number" step="0.01" className="modern-input" value={editingItem.cost} onChange={(e) => setEditingItem({ ...editingItem, cost: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Personalization</label>
                                <input type="text" className="modern-input" value={editingItem.personalization || ''} onChange={(e) => setEditingItem({ ...editingItem, personalization: e.target.value })} />
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

export default GiftsTab;
