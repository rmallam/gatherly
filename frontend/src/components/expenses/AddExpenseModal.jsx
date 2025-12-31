import React, { useState } from 'react';
import { X, DollarSign, Receipt, Calendar } from 'lucide-react';

const AddExpenseModal = ({ eventId, event, onClose, onExpenseAdded }) => {
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        description: '',
        category: 'food',
        paidBy: '',
        expenseDate: new Date().toISOString().split('T')[0],
        splitType: 'equal'
    });
    const [customSplits, setCustomSplits] = useState({});
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Get all participants (event owner + guests who are users)
    const participants = [
        { id: event.user_id, name: event.user_name || 'Event Owner' },
        ...(event.guests || [])
            .filter(g => g.user_id)
            .map(g => ({ id: g.user_id, name: g.name }))
    ].filter((p, index, self) =>
        index === self.findIndex(t => t.id === p.id)
    );

    // Initialize selected participants and paidBy with current user
    React.useEffect(() => {
        if (selectedParticipants.length === 0 && participants.length > 0) {
            setSelectedParticipants(participants.map(p => p.id));

            // Set paidBy to current user if available, otherwise first participant
            const userId = localStorage.getItem('userId');
            const defaultPayer = participants.find(p => p.id === userId) ? userId : participants[0]?.id;
            if (defaultPayer && !formData.paidBy) {
                setFormData(prev => ({ ...prev, paidBy: defaultPayer }));
            }
        }
    }, [participants.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount');
                setLoading(false);
                return;
            }

            if (selectedParticipants.length === 0) {
                setError('Please select at least one participant');
                setLoading(false);
                return;
            }

            // Calculate splits
            let splits = [];
            if (formData.splitType === 'equal') {
                const splitAmount = amount / selectedParticipants.length;
                splits = selectedParticipants.map(userId => ({
                    userId,
                    amount: splitAmount
                }));
            } else {
                // Custom splits
                splits = selectedParticipants.map(userId => ({
                    userId,
                    amount: parseFloat(customSplits[userId] || 0)
                }));

                // Validate custom splits sum to total
                const total = splits.reduce((sum, s) => sum + s.amount, 0);
                if (Math.abs(total - amount) > 0.01) {
                    setError(`Split amounts ($${total.toFixed(2)}) must equal total amount ($${amount.toFixed(2)})`);
                    setLoading(false);
                    return;
                }
            }

            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                amount,
                splits
            };

            console.log('Sending expense creation request:', payload);
            console.log('Splits:', splits);

            const response = await fetch(`${API_URL}/api/events/${eventId}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log('Expense creation response status:', response.status);
            const responseText = await response.text();
            console.log('Expense creation response:', responseText);

            if (response.ok) {
                const data = JSON.parse(responseText);
                console.log('Expense created successfully:', data);
                // Close modal and refresh data
                onExpenseAdded();
                onClose();
            } else {
                const data = responseText ? JSON.parse(responseText) : {};
                console.error('Expense creation failed:', data);
                setError(data.error || 'Failed to create expense');
            }
        } catch (error) {
            console.error('Error creating expense:', error);
            setError('Failed to create expense');
        } finally {
            setLoading(false);
        }
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCustomSplitChange = (userId, value) => {
        setCustomSplits(prev => ({
            ...prev,
            [userId]: value
        }));
    };

    const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED'];
    const categories = ['food', 'transport', 'accommodation', 'activities', 'entertainment', 'other'];

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.75)'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    padding: '2rem',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Add Expense
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Amount and Currency */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Amount *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-tertiary)'
                                    }}
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Currency
                            </label>
                            <select
                                className="input"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            >
                                {currencies.map(curr => (
                                    <option key={curr} value={curr}>{curr}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Description *
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., Dinner at restaurant"
                            required
                        />
                    </div>

                    {/* Category and Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Category
                            </label>
                            <select
                                className="input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Date
                            </label>
                            <input
                                type="date"
                                className="input"
                                value={formData.expenseDate}
                                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Paid By */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Paid By
                        </label>
                        <select
                            className="input"
                            value={formData.paidBy}
                            onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                        >
                            {participants.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Split Type */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Split Type
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="splitType"
                                    value="equal"
                                    checked={formData.splitType === 'equal'}
                                    onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
                                />
                                <span style={{ color: 'var(--text-primary)' }}>Equal Split</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="splitType"
                                    value="custom"
                                    checked={formData.splitType === 'custom'}
                                    onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
                                />
                                <span style={{ color: 'var(--text-primary)' }}>Custom Split</span>
                            </label>
                        </div>
                    </div>

                    {/* Participants */}
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>
                            Split Among ({selectedParticipants.length} selected)
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {participants.map(p => (
                                <div
                                    key={p.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: selectedParticipants.includes(p.id) ? 'var(--bg-secondary)' : 'transparent',
                                        border: '1px solid var(--border)'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedParticipants.includes(p.id)}
                                        onChange={() => toggleParticipant(p.id)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ flex: 1, color: 'var(--text-primary)' }}>{p.name}</span>
                                    {formData.splitType === 'custom' && selectedParticipants.includes(p.id) && (
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="input"
                                            style={{ width: '100px' }}
                                            placeholder="0.00"
                                            value={customSplits[p.id] || ''}
                                            onChange={(e) => handleCustomSplitChange(p.id, e.target.value)}
                                        />
                                    )}
                                    {formData.splitType === 'equal' && selectedParticipants.includes(p.id) && formData.amount && (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            ${(parseFloat(formData.amount) / selectedParticipants.length).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
