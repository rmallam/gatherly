import React from 'react';
import API_URL from '../../config/api';
import { Trash2, DollarSign } from 'lucide-react';

const ExpenseList = ({ expenses, eventId, onExpenseDeleted, onExpenseClick, userId }) => {

    const handleDelete = async (expenseId) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${eventId}/expenses/${expenseId}`, {
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

    const getCategoryGradient = (category) => {
        const gradients = {
            food: 'linear-gradient(135deg, #10b981, #059669)',
            transport: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            accommodation: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            activities: 'linear-gradient(135deg, #f59e0b, #d97706)',
            entertainment: 'linear-gradient(135deg, #ec4899, #db2777)',
            other: 'linear-gradient(135deg, #6b7280, #4b5563)'
        };
        return gradients[category] || gradients.other;
    };

    if (expenses.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
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
                <div key={month} style={{ marginBottom: '1rem' }}>
                    {/* Month Header - Simple text like Splitwise */}
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        paddingLeft: '0.5rem'
                    }}>
                        {month}
                    </div>

                    {/* Expense Items */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {groupedExpenses[month]
                            .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
                            .map(expense => {
                                const status = getExpenseStatus(expense);
                                const date = new Date(expense.expense_date);

                                return (
                                    <div
                                        key={expense.id}
                                        onClick={() => onExpenseClick && onExpenseClick(expense)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '16px 0', // Vertical spacing
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Date Column - Splitwise Style */}
                                        <div style={{
                                            minWidth: '40px',
                                            textAlign: 'center',
                                            color: '#8e8e93',
                                            marginRight: '12px',
                                            paddingLeft: '4px'
                                        }}>
                                            <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 500, lineHeight: 1, marginBottom: '2px' }}>
                                                {date.toLocaleDateString('en-US', { month: 'short' })}
                                            </div>
                                            <div style={{ fontSize: '20px', fontWeight: 300, color: '#8e8e93', lineHeight: 1 }}>
                                                {date.getDate()}
                                            </div>
                                        </div>

                                        {/* Icon */}
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            flexShrink: 0,
                                            marginRight: '16px'
                                        }}>
                                            {getCategoryIcon(expense.category)}
                                        </div>

                                        {/* Middle Details */}
                                        <div style={{ flex: 1, minWidth: '0', overflow: 'hidden', marginRight: '8px' }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: 500,
                                                color: '#ffffff',
                                                marginBottom: '2px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {expense.description}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#8e8e93',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {expense.paid_by === userId || expense.paid_by_id === userId
                                                    ? `you paid ${expense.currency}${parseFloat(expense.amount).toFixed(2)}`
                                                    : `${expense.paid_by_name?.split(' ')[0]} paid ${expense.currency}${parseFloat(expense.amount).toFixed(2)}`
                                                }
                                            </div>
                                        </div>

                                        {/* Right Status */}
                                        <div style={{
                                            textAlign: 'right',
                                            minWidth: '80px',
                                            paddingRight: '8px'
                                        }}>
                                            {status.type !== 'not_involved' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: status.color,
                                                        fontWeight: 500,
                                                        marginBottom: '1px'
                                                    }}>
                                                        {status.text}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: status.color
                                                    }}>
                                                        {expense.currency}{status.amount.toFixed(2)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#8e8e93'
                                                }}>
                                                    not involved
                                                </div>
                                            )}
                                        </div>
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
