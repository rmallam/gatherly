import React, { useState } from 'react';
import { DollarSign, Plus, X, Check, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

const BudgetTab = ({ event, onUpdateBudget }) => {
    const [categories, setCategories] = useState(event.budget?.categories || [
        { id: '1', name: 'Venue', allocated: 0, spent: 0, color: '#6366f1' },
        { id: '2', name: 'Catering', allocated: 0, spent: 0, color: '#10b981' },
        { id: '3', name: 'Decorations', allocated: 0, spent: 0, color: '#f59e0b' },
        { id: '4', name: 'Entertainment', allocated: 0, spent: 0, color: '#ef4444' },
        { id: '5', name: 'Photography', allocated: 0, spent: 0, color: '#8b5cf6' },
        { id: '6', name: 'Other', allocated: 0, spent: 0, color: '#6b7280' }
    ]);
    const [totalBudget, setTotalBudget] = useState(event.budget?.total || 0);
    const [showAddExpense, setShowAddExpense] = useState(null);
    const [newExpense, setNewExpense] = useState({ amount: '', description: '' });

    const handleUpdateBudget = (categoryId, field, value) => {
        const updated = categories.map(cat =>
            cat.id === categoryId ? { ...cat, [field]: parseFloat(value) || 0 } : cat
        );
        setCategories(updated);
        onUpdateBudget?.({ categories: updated, total: totalBudget });
    };

    const handleAddExpense = (categoryId) => {
        if (!newExpense.amount) return;

        const updated = categories.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    spent: cat.spent + (parseFloat(newExpense.amount) || 0)
                };
            }
            return cat;
        });

        setCategories(updated);
        setNewExpense({ amount: '', description: '' });
        setShowAddExpense(null);
        onUpdateBudget?.({ categories: updated, total: totalBudget });
    };

    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const remaining = totalAllocated - totalSpent;
    const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return (
        <div>
            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white' }}>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Budget</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>${totalAllocated.toFixed(2)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={16} style={{ color: 'var(--error)' }} />
                        Total Spent
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>${totalSpent.toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        {spentPercentage.toFixed(1)}% of budget
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Remaining</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: remaining >= 0 ? 'var(--success)' : 'var(--error)' }}>
                        ${Math.abs(remaining).toFixed(2)}
                    </div>
                    {remaining < 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertCircle size={12} /> Over budget
                        </div>
                    )}
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Budget Usage</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: spentPercentage > 100 ? 'var(--error)' : 'var(--primary)' }}>
                        {spentPercentage.toFixed(1)}%
                    </span>
                </div>
                <div style={{ height: '12px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(spentPercentage, 100)}%`,
                        background: spentPercentage > 90 ? 'linear-gradient(90deg, var(--error) 0%, #dc2626 100%)' : 'linear-gradient(90deg, var(--success) 0%, #059669 100%)',
                        transition: 'width 0.5s ease',
                        borderRadius: '999px'
                    }}></div>
                </div>
            </div>

            {/* Budget Categories */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {categories.map(category => {
                    const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
                    const isOverBudget = category.spent > category.allocated;

                    return (
                        <div key={category.id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: category.color }}></div>
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{category.name}</h4>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Allocated</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={category.allocated}
                                                onChange={(e) => handleUpdateBudget(category.id, 'allocated', e.target.value)}
                                                style={{
                                                    width: '120px',
                                                    padding: '0.375rem 0.75rem',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--primary)'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Spent</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: isOverBudget ? 'var(--error)' : 'var(--success)' }}>
                                                ${category.spent.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Remaining</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: isOverBudget ? 'var(--error)' : 'var(--text-primary)' }}>
                                                ${(category.allocated - category.spent).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddExpense(showAddExpense === category.id ? null : category.id)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    <Plus size={14} /> Add Expense
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(percentage, 100)}%`,
                                    background: category.color,
                                    transition: 'width 0.3s ease',
                                    borderRadius: '999px'
                                }}></div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {percentage.toFixed(1)}% used
                                {isOverBudget && <span style={{ color: 'var(--error)', marginLeft: '0.5rem', fontWeight: 600 }}>⚠️ Over budget!</span>}
                            </div>

                            {/* Add Expense Form */}
                            {showAddExpense === category.id && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 500 }}>Amount</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="input"
                                                value={newExpense.amount}
                                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                placeholder="0.00"
                                                style={{ fontSize: '0.875rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 500 }}>Description (optional)</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={newExpense.description}
                                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                                placeholder="What was this for?"
                                                style={{ fontSize: '0.875rem' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleAddExpense(category.id)}
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.875rem', padding: '0.625rem 1rem' }}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => setShowAddExpense(null)}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.875rem', padding: '0.625rem 1rem' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetTab;
