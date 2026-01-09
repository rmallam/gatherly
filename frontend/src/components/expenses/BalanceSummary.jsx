import React, { useState } from 'react';
import API_URL from '../../config/api';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';

const BalanceSummary = ({ balances, eventId, onSettled }) => {
    const [settling, setSettling] = useState(null);
    const [showPendingDialog, setShowPendingDialog] = useState(false);
    const [pendingBalance, setPendingBalance] = useState(null);

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
            const response = await fetch(`${API_URL}/events/${eventId}/settlements`, {
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

    if (balances.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                No balances to settle
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {balances.map((balance, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '16px 0',
                            transition: 'all 0.2s',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)' // Subtle divider for balances feels right as they are unrelated items usually
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                            <span style={{
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {balance.fromUserName}
                            </span>
                            <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                            <span style={{
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {balance.toUserName}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' }}>
                                {balance.currency} {parseFloat(balance.amount).toFixed(2)}
                            </span>
                            <button
                                onClick={() => handleSettle(balance)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.8125rem',
                                    padding: balance.isPending ? '0.5rem' : '0.5rem 0.875rem',
                                    whiteSpace: 'nowrap',
                                    background: balance.isPending ? '#fbbf24' : 'rgba(16, 185, 129, 0.3)',
                                    border: balance.isPending ? '1px solid #fbbf24' : '1px solid rgba(16, 185, 129, 0.5)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                disabled={settling === balance}
                                onMouseEnter={(e) => {
                                    if (!balance.isPending) {
                                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!balance.isPending) {
                                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                                    }
                                }}
                            >
                                {balance.isPending ? (
                                    <AlertCircle size={16} />
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
