import React, { useState } from 'react';
import API_URL from '../../config/api';
import { ArrowRight, Check, AlertCircle, Loader, X } from 'lucide-react';

const BalanceSummary = ({ balances, eventId, onSettled }) => {
    const [settling, setSettling] = useState(null);
    const [showSettlementConfirm, setShowSettlementConfirm] = useState(null); // balance object to confirm
    const [showPendingDialog, setShowPendingDialog] = useState(false);
    const [pendingBalance, setPendingBalance] = useState(null);

    const checkSettle = (balance) => {
        // Check if user is pending
        if (balance.isPending) {
            setPendingBalance(balance);
            setShowPendingDialog(true);
            return;
        }

        setShowSettlementConfirm(balance);
    };

    const confirmSettle = async () => {
        if (!showSettlementConfirm) return;

        const balance = showSettlementConfirm;
        setSettling(balance);
        setShowSettlementConfirm(null);

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
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
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
                                onClick={() => checkSettle(balance)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    padding: '0',
                                    background: balance.isPending ? 'rgba(251, 191, 36, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    border: balance.isPending ? '1px solid #fbbf24' : '1px solid #10b981',
                                    borderRadius: '50%',
                                    color: balance.isPending ? '#fbbf24' : '#10b981',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                disabled={settling === balance}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = balance.isPending ? 'rgba(251, 191, 36, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = balance.isPending ? 'rgba(251, 191, 36, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title={balance.isPending ? "User Pending" : "Settle"}
                            >
                                {balance.isPending ? (
                                    <AlertCircle size={16} />
                                ) : (
                                    settling === balance ? (
                                        <Loader size={16} className="animate-spin" />
                                    ) : (
                                        <Check size={18} />
                                    )
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending User Dialog - Fixed Visibility */}
            {showPendingDialog && pendingBalance && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)', // Darker overlay
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setShowPendingDialog(false)}
                >
                    <div
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: '1.5rem',
                            background: '#1f2937', // Solid dark background to prevent bleed-through
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <AlertCircle size={24} style={{ color: '#fbbf24' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f9fafb', margin: 0 }}>
                                User Not Registered
                            </h3>
                        </div>
                        <p style={{ color: '#d1d5db', marginBottom: '1rem', lineHeight: '1.5' }}>
                            <strong>{pendingBalance.fromUserName}</strong> hasn't signed up yet. They need to download the app and create an account to settle this balance.
                        </p>
                        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
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

            {/* Settle Confirmation Dialog - Custom Glassmorphic Modal */}
            {showSettlementConfirm && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setShowSettlementConfirm(null)}
                >
                    <div
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: '1.5rem',
                            background: '#1f2937', // Solid dark background
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f9fafb', marginBottom: '1rem' }}>
                            Confirm Settlement
                        </h3>
                        <p style={{ color: '#d1d5db', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Mark <strong>{showSettlementConfirm.currency} {parseFloat(showSettlementConfirm.amount).toFixed(2)}</strong> from <strong>{showSettlementConfirm.fromUserName}</strong> to <strong>{showSettlementConfirm.toUserName}</strong> as paid?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowSettlementConfirm(null)}
                                className="btn btn-secondary"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSettle}
                                className="btn btn-primary"
                                style={{ flex: 1, justifyContent: 'center', background: 'var(--success)', border: 'none' }}
                            >
                                <Check size={16} /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BalanceSummary;
