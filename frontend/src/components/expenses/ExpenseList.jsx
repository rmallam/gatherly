import React from 'react';
import API_URL from '../../config/api';
import { Trash2, DollarSign } from 'lucide-react';

const ExpenseList = ({ expenses, eventId, onExpenseDeleted, userId }) => {

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

    // Group expenses by month
    const groupByMonth = (expenses) => {
        const groups = {};
        expenses.forEach(expense => {
            const date = new Date(expense.expense_date);
            const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(expense);
        });
        return groups;
    };

    // Determine expense status for current user
    const getExpenseStatus = (expense) => {
        const isPaidByMe = expense.paid_by === userId || expense.paid_by_id === userId;
        const splits = expense.splits || [];
        // Convert to string for comparison to handle type mismatches
        const userIdStr = String(userId);
        const mySplit = splits.find(s => String(s.user_id) === userIdStr);

        console.log('💰 Expense Debug:', JSON.stringify({ userId: userIdStr, splitsCount: splits.length, splits: splits.map(s => String(s.user_id)), foundMatch: !!mySplit }));

        if (!mySplit) {
            return { type: 'not_involved', text: 'not involved', color: 'var(--text-tertiary)' };
        }

        if (isPaidByMe) {
            // I paid, so others owe me
            const othersOwe = splits
                .filter(s => s.user_id !== userId)
                .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
            return {
                type: 'lent',
                text: 'you lent',
                amount: othersOwe,
                color: '#10b981'
            };
        } else {
            // Someone else paid, I owe them
            return {
                type: 'borrowed',
                text: 'you borrowed',
                amount: parseFloat(mySplit.amount || 0),
                color: '#f59e0b'
            };
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            food: '🍽️',
            transport: '🚗',
            accommodation: '🏨',
            activities: '🎯',
            entertainment: '🎬',
            other: '📝'
        };
        return icons[category] || '📝';
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

    const groupedExpenses = groupByMonth(expenses);
    const sortedMonths = Object.keys(groupedExpenses).sort((a, b) => {
        return new Date(b) - new Date(a); // Most recent first
    });

    return (
        <div>
            {sortedMonths.map(month => (
                <div key={month} style={{ marginBottom: '2rem' }}>
                    {/* Month Header */}
                    <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {month}
                    </h3>

                    {/* Expense Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {groupedExpenses[month]
                            .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
                            .map(expense => {
                                const status = getExpenseStatus(expense);
                                const date = new Date(expense.expense_date);

                                return (
                                    <div
                                        key={expense.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    >
                                        {/* Date */}
                                        <div style={{
                                            minWidth: '3rem',
                                            textAlign: 'center',
                                            color: 'var(--text-tertiary)',
                                            fontSize: '0.75rem'
                                        }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {date.toLocaleDateString('en-US', { month: 'short' })}
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {date.getDate()}
                                            </div>
                                        </div>

                                        {/* Icon */}
                                        <div style={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            borderRadius: 'var(--radius)',
                                            background: 'var(--bg-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            flexShrink: 0
                                        }}>
                                            {getCategoryIcon(expense.category)}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '0.9375rem',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.25rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {expense.description}
                                            </div>
                                            <div style={{
                                                fontSize: '0.8125rem',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {expense.paid_by_name} paid {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Amount & Status */}
                                        <div style={{
                                            textAlign: 'right',
                                            minWidth: '5rem'
                                        }}>
                                            {status.type !== 'not_involved' ? (
                                                <>
                                                    <div style={{
                                                        fontSize: '0.9375rem',
                                                        fontWeight: 600,
                                                        color: status.color,
                                                        marginBottom: '0.125rem'
                                                    }}>
                                                        {expense.currency} {status.amount.toFixed(2)}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: status.color,
                                                        fontWeight: 500
                                                    }}>
                                                        {status.text}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: status.color,
                                                    fontWeight: 500
                                                }}>
                                                    {status.text}
                                                </div>
                                            )}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-tertiary)',
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius)',
                                                transition: 'all 0.2s',
                                                flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'none';
                                                e.currentTarget.style.color = 'var(--text-tertiary)';
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ExpenseList;
