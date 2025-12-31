import React from 'react';
import { Trash2, Calendar, User, DollarSign } from 'lucide-react';

const ExpenseList = ({ expenses, eventId, onExpenseDeleted }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleDelete = async (expenseId) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events/${eventId}/expenses/${expenseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                onExpenseDeleted();
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <DollarSign size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-tertiary)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    No expenses yet
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Click "Add Expense" to start tracking expenses
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {expenses.map(expense => (
                <div
                    key={expense.id}
                    className="card"
                    style={{
                        padding: '1.5rem',
                        position: 'relative',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                >
                    {/* Delete Button - Top Right */}
                    <button
                        onClick={() => handleDelete(expense.id)}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                        title="Delete expense"
                    >
                        <Trash2 size={18} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                        {/* Category Icon */}
                        <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: 'var(--radius-lg)',
                            background: getCategoryGradient(expense.category),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <span style={{ fontSize: '1.75rem' }}>{getCategoryEmoji(expense.category)}</span>
                        </div>

                        {/* Expense Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                                fontSize: '1.0625rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                marginBottom: '0.5rem',
                                paddingRight: '2rem' // Space for delete button
                            }}>
                                {expense.description}
                            </h4>

                            {/* Meta Information */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.75rem',
                                fontSize: '0.8125rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.75rem'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <User size={14} />
                                    {expense.paid_by_name}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <Calendar size={14} />
                                    {new Date(expense.expense_date).toLocaleDateString()}
                                </span>
                                <span style={{
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: 'var(--radius)',
                                    background: 'var(--bg-secondary)',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                }}>
                                    {expense.category}
                                </span>
                            </div>

                            {/* Amount and Split Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid var(--border)'
                            }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '0.25rem'
                                }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        {expense.currency}
                                    </span>
                                    {parseFloat(expense.amount).toFixed(2)}
                                </div>
                                <div style={{
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 500
                                }}>
                                    Split {expense.splits?.length || 0} ways
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const getCategoryEmoji = (category) => {
    const emojis = {
        food: '🍽️',
        transport: '🚗',
        accommodation: '🏨',
        activities: '🎯',
        entertainment: '🎬',
        other: '📝'
    };
    return emojis[category] || '📝';
};

const getCategoryGradient = (category) => {
    const gradients = {
        food: 'linear-gradient(135deg, #667eea, #764ba2)',
        transport: 'linear-gradient(135deg, #f093fb, #f5576c)',
        accommodation: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        activities: 'linear-gradient(135deg, #43e97b, #38f9d7)',
        entertainment: 'linear-gradient(135deg, #fa709a, #fee140)',
        other: 'linear-gradient(135deg, #a8edea, #fed6e3)'
    };
    return gradients[category] || gradients.other;
};

export default ExpenseList;
