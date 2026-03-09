import React, { useState, useEffect } from 'react';
import { Gift, Plus, X, Check, Trash2, Edit2, ExternalLink } from 'lucide-react';
import API_URL from '../../config/api';
import AIGiftsGenerator from '../ai/AIGiftsGenerator';
import '../../pages/EventTabs.css';
import { formatCurrency, getCurrencySymbol } from '../../utils/currencyUtils';

const GiftsTab = ({ event }) => {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newGift, setNewGift] = useState({
        name: '',
        description: '',
        estimated_price: '',
        url: ''
    });

    const fetchGifts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/gifts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGifts(data);
            }
        } catch (error) {
            console.error('Failed to fetch gifts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGifts();
    }, [event.id]);

    const handleAddGift = async () => {
        if (!newGift.name) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/gifts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newGift.name,
                    description: newGift.description,
                    estimated_price: parseFloat(newGift.estimated_price) || 0,
                    url: newGift.url
                })
            });

            if (res.ok) {
                fetchGifts();
                setNewGift({ name: '', description: '', estimated_price: '', url: '' });
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Failed to add gift:', error);
        }
    };

    const handleDeleteGift = async (id) => {
        if (!confirm('Delete this gift?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/gifts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchGifts();
            }
        } catch (error) {
            console.error('Failed to delete gift:', error);
        }
    };

    const handleUpdateStatus = async (id, is_purchased) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/gifts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_purchased })
            });

            if (res.ok) {
                fetchGifts();
            }
        } catch (error) {
            console.error('Failed to update gift status:', error);
        }
    };

    const totalCost = gifts.reduce((sum, gift) => sum + parseFloat(gift.estimated_price || 0), 0);
    const purchasedGifts = gifts.filter(g => g.is_purchased).length;

    if (loading) {
        return <div className="tab-empty-state">Loading Registry...</div>;
    }

    return (
        <div className="event-tab-page">
            {/* AI Generator UI placed at top like a search bar */}
            <AIGiftsGenerator event={event} onGiftsGenerated={fetchGifts} />

            {/* Stats */}
            <div className="tab-stats-grid">
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Gift size={14} color="var(--primary)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Items</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{gifts.length}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Check size={14} color="#10b981" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Purchased</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{purchasedGifts} / {gifts.length}</span>
                </div>
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Est. Total</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(totalCost, event.country)}</span>
                </div>
            </div>

            {/* Gift List */}
            {gifts.length > 0 ? (
                <div className="tab-list">
                    {gifts.map(gift => (
                        <div key={gift.id} className="tab-list-item" style={{ opacity: gift.is_purchased ? 0.7 : 1 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: gift.is_purchased ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                color: gift.is_purchased ? '#10b981' : 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {gift.is_purchased ? <Check size={20} /> : <Gift size={20} />}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, textDecoration: gift.is_purchased ? 'line-through' : 'none' }}>
                                    {gift.name}
                                </div>
                                {gift.description && (
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {gift.description}
                                    </div>
                                )}
                                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(gift.estimated_price, event.country)}</span>
                                    {gift.url && (
                                        <a href={gift.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', textDecoration: 'none' }}>
                                            <ExternalLink size={12} /> Link
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <select
                                    value={gift.is_purchased ? 'true' : 'false'}
                                    onChange={(e) => handleUpdateStatus(gift.id, e.target.value === 'true')}
                                    className="status-select"
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 20,
                                        border: '1px solid var(--border)',
                                        background: gift.is_purchased ? '#ecfdf5' : 'var(--bg-primary)',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: gift.is_purchased ? '#059669' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="false">Needed</option>
                                    <option value="true">Purchased</option>
                                </select>

                                <div className="item-actions">
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
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>Registry is Empty</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Add gifts or use the AI Generator above.</p>
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
                                    placeholder="e.g., Coffee Maker"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Description / Brand</label>
                                <input type="text" className="modern-input" value={newGift.description} onChange={(e) => setNewGift({ ...newGift, description: e.target.value })} placeholder="e.g., Nespresso Vertuo" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Est. Price ({getCurrencySymbol(event.country)})</label>
                                    <input type="number" step="0.01" className="modern-input" value={newGift.estimated_price} onChange={(e) => setNewGift({ ...newGift, estimated_price: e.target.value })} placeholder="0.00" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Store Link (URL)</label>
                                    <input type="url" className="modern-input" value={newGift.url} onChange={(e) => setNewGift({ ...newGift, url: e.target.value })} placeholder="https://" />
                                </div>
                            </div>
                            <button onClick={handleAddGift} className="btn-primary" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                                Add to Registry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftsTab;
