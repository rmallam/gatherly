import React from 'react';
import { X, Trash2, Calendar, User, FileText, Edit2 } from 'lucide-react';
import API_URL from '../../config/api';

const ExpenseDetail = ({ expense, eventId, onClose, onDelete, onEdit, currentUserId, participants = [] }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [isZoomed, setIsZoomed] = React.useState(false);

    if (!expense) return null;

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
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

    const getUserName = (userId) => {
        if (!userId) return 'Unknown User';
        if (String(userId) === String(currentUserId)) return 'You';

        // Try to find in participants
        const participant = participants.find(p => String(p.id) === String(userId) || String(p.user_id) === String(userId));
        if (participant) return participant.name || participant.username || participant.email?.split('@')[0] || 'Unknown';

        // Fallback checks
        if (String(userId) === String(expense.paid_by) || String(userId) === String(expense.paid_by_id)) {
            return expense.paid_by_name || 'Payer';
        }

        return 'Participant';
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
                        onClick={() => onEdit(expense)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '8px', cursor: 'pointer' }}
                    >
                        <Edit2 size={24} />
                    </button>
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
                                {(split.userName || getUserName(split.user_id)).charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {String(split.user_id) === String(expense.paid_by) ? (
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {split.userName || getUserName(split.user_id)}'s share <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{expense.currency}{parseFloat(split.amount).toFixed(2)}</span>
                                        </span>
                                    ) : (
                                        <>
                                            {split.userName || getUserName(split.user_id)} {String(split.user_id) === String(currentUserId) ? 'owe' : 'owes'} <span style={{ fontWeight: 700, color: '#f59e0b' }}>{expense.currency}{parseFloat(split.amount).toFixed(2)}</span>
                                        </>
                                    )}
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

            {/* Receipt Image */}
            {expense.receipt_url && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
                        Receipt
                    </h3>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in' }} onClick={() => setIsZoomed(true)}>
                        <img 
                            src={expense.receipt_url} 
                            alt="Receipt" 
                            style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'contain', background: '#f8f9fa' }} 
                        />
                    </div>
                </div>
            )}

            {/* Lightbox for Receipt */}
            {isZoomed && (
                <div 
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
                    }}
                    onClick={() => setIsZoomed(false)}
                >
                    <button 
                        onClick={() => setIsZoomed(false)}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10000 }}
                    >
                        <X size={32} />
                    </button>
                    <img 
                        src={expense.receipt_url} 
                        alt="Receipt Fullscreen" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                        onClick={e => e.stopPropagation()} // Prevent click from closing immediately if tapping image
                    />
                </div>
            )}

            {/* Native Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
                }}>
                    <div style={{
                        background: 'var(--bg-primary)', borderRadius: '24px', padding: '32px',
                        maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444'
                        }}>
                            <Trash2 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                            Delete Expense
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
                            Are you sure you want to permanently delete this expense? This action cannot be undone and will update everyone's balances.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseDetail;
