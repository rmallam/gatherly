import React from 'react';
import { X, Trash2, Calendar, User, FileText } from 'lucide-react';
import API_URL from '../../config/api';

const ExpenseDetail = ({ expense, eventId, onClose, onDelete, currentUserId }) => {
    if (!expense) return null;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${eventId}/expenses/${expense.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                onDelete(expense.id);
                onClose();
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper to find user name from split or other data if needed
    // Assuming splits have user_name or similar, or we just list amounts if names aren't in splits directly.
    // Based on previous code, splits might only have user_id. We might need a user lookup or rely on backend populate.
    // Let's check ExpenseList usage - it didn't strictly iterate splits for names.
    // However, usually splits should have names. If not, we might be limited.
    // For now, I'll assume splits might be basic.

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-primary)',
            zIndex: 2000,
            padding: '16px',
            overflowY: 'auto'
        }}>
            {/* Header / Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '8px', marginLeft: '-8px', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={handleDelete} // Only if creator? Or admin? Allowing for now as per previous logic
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '8px', cursor: 'pointer' }}
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>

            {/* Title Section */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        flexShrink: 0
                    }}>
                        📝
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.2 }}>
                            {expense.description}
                        </h2>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                        </div>
                    </div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Added by <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{expense.paid_by_name}</span> on {formatDate(expense.expense_date)}
                </div>
            </div>

            {/* Payment Details */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
                    Who paid
                </h3>
                {/* Visualizing "One person paid" essentially */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
                    }}>
                        {expense.paid_by_name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {expense.paid_by_name} paid <span style={{ fontWeight: 700 }}>{expense.currency}{parseFloat(expense.amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Details */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
                    Who owes what
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {expense.splits && expense.splits.map((split, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 600
                            }}>
                                {/* We might not have names in splits, need to check data structure or pass users map */}
                                {/* For MVP, if we don't have name, usage placeholder or User ID logic found in ExpenseList */}
                                <User size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {/* Ideally we map user_id to name. For now let's hope it's populated or handle gracefully */}
                                    {String(split.user_id) === String(expense.paid_by) ? 'Payer' : 'Participant'} owes <span style={{ fontWeight: 700, color: '#f59e0b' }}>{expense.currency}{parseFloat(split.amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!expense.splits || expense.splits.length === 0) && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Split equally between all participants
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ExpenseDetail;
