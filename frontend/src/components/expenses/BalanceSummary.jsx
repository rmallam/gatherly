import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const BalanceSummary = ({ balances, eventId, onSettled }) => {
    const [settling, setSettling] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleSettle = async (balance) => {
        if (!confirm(`Settle ${balance.currency} ${balance.amount.toFixed(2)} from ${balance.fromUserName} to ${balance.toUserName}?`)) {
            return;
        }

        setSettling(balance);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events/${eventId}/settlements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fromUser: balance.fromUser,
                    toUser: balance.toUser,
                    amount: balance.amount,
                    currency: balance.currency
                })
            });

            if (response.ok) {
                onSettled();
            }
        } catch (error) {
            console.error('Error settling balance:', error);
        } finally {
            setSettling(null);
        }
    };

    if (balances.length === 0) return null;

    return (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Balances to Settle
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {balances.map((balance, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)'
                        }}
                    >
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {balance.fromUserName}
                            </span>
                            <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {balance.toUserName}
                            </span>
                        </div>
                        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ef4444' }}>
                            {balance.currency} {balance.amount.toFixed(2)}
                        </span>
                        <button
                            onClick={() => handleSettle(balance)}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                            disabled={settling === balance}
                        >
                            <Check size={16} />
                            {settling === balance ? 'Settling...' : 'Settle Up'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BalanceSummary;
