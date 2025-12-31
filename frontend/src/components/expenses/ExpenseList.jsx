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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expenses.map(expense => (
                <div
                    key={expense.id}
                    className="card"
                    style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                    {/* Category Icon */}
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '12px',
                        background: getCategoryGradient(expense.category),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>{getCategoryEmoji(expense.category)}</span>
                    </div>

                    {/* Expense Details */}
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            {expense.description}
                        </h4>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <User size={14} />
                                {expense.paid_by_name}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Calendar size={14} />
                                {new Date(expense.expense_date).toLocaleDateString()}
                            </span>
                            <span>{expense.category}</span>
                        </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Split {expense.splits?.length || 0} ways
                        </p>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => handleDelete(expense.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)',
                            padding: '0.5rem'
                        }}
                        title="Delete expense"
                    >
                        <Trash2 size={18} />
                    </button>
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
