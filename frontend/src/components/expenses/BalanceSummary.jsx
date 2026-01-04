import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const BalanceSummary = ({ balances, eventId, onSettled }) => {
    const [settling, setSettling] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleSettle = async (balance) => {
        if (!confirm(`Settle ${balance.currency} ${parseFloat(balance.amount).toFixed(2)} from ${balance.fromUserName} to ${balance.toUserName}?`)) {
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Balances to Settle
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {balances.map((balance, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)'
                        }}
                    >
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                                <span style={{
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {balance.fromUserName}
                                </span>
                                {balance.isPending && (
                                    <span style={{
                                        fontSize: '0.625rem',
                                        padding: '0.125rem 0.375rem',
                                        borderRadius: '10px',
                                        background: '#fbbf24',
                                        color: '#78350f',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        📧 Pending
                                    </span>
                                )}
                            </div>
                            <ArrowRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                            <span style={{
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {balance.toUserName}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444', whiteSpace: 'nowrap' }}>
                                {balance.currency} {parseFloat(balance.amount).toFixed(2)}
                            </span>
                            {balance.isPending ? (
                                <div style={{
                                    fontSize: '0.625rem',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'right',
                                    width: '80px',
                                    lineHeight: '1.2'
                                }}>
                                    Must sign up
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleSettle(balance)}
                                    className="btn btn-primary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        fontSize: '0.75rem',
                                        padding: '0.5rem 0.75rem',
                                        whiteSpace: 'nowrap'
                                    }}
                                    disabled={settling === balance}
                                >
                                    <Check size={14} />
                                    {settling === balance ? 'Settling...' : 'Settle'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BalanceSummary;
