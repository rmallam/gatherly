import React, { useState } from 'react';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';

const BalanceSummary = ({ balances, eventId, onSettled }) => {
    const [settling, setSettling] = useState(null);
    const [showPendingDialog, setShowPendingDialog] = useState(false);
    const [pendingBalance, setPendingBalance] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleSettle = async (balance) => {
        // Check if user is pending
        if (balance.isPending) {
            setPendingBalance(balance);
            setShowPendingDialog(true);
            return;
        }

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
        <>
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
                                <button
                                    onClick={() => handleSettle(balance)}
                                    className="btn btn-primary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        fontSize: '0.75rem',
                                        padding: '0.5rem 0.75rem',
                                        whiteSpace: 'nowrap',
                                        background: balance.isPending ? '#fbbf24' : undefined,
                                        borderColor: balance.isPending ? '#fbbf24' : undefined
                                    }}
                                    disabled={settling === balance}
                                >
                                    {balance.isPending ? (
                                        <>
                                            <AlertCircle size={14} />
                                            Pending
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} />
                                            {settling === balance ? 'Settling...' : 'Settle'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending User Dialog */}
            {showPendingDialog && pendingBalance && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setShowPendingDialog(false)}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: '1.5rem'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <AlertCircle size={24} style={{ color: '#fbbf24' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                User Not Registered
                            </h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                            <strong>{pendingBalance.fromUserName}</strong> hasn't signed up yet. They need to download the app and create an account to settle this balance.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            Amount owed: <strong style={{ color: '#ef4444' }}>{pendingBalance.currency} {parseFloat(pendingBalance.amount).toFixed(2)}</strong>
                        </p>
                        <button
                            onClick={() => setShowPendingDialog(false)}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BalanceSummary;
