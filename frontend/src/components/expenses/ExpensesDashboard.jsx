import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Users } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';
import ExpenseList from './ExpenseList';
import BalanceSummary from './BalanceSummary';

const ExpensesDashboard = ({ eventId, event }) => {
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [summary, setSummary] = useState(null);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchExpenses();
        fetchBalances();
    }, [eventId]);

    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = filter === 'all'
                ? `${API_URL}/api/events/${eventId}/expenses`
                : `${API_URL}/api/events/${eventId}/expenses?category=${filter}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setExpenses(data.expenses || []);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalances = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events/${eventId}/balances`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setBalances(data.balances || []);
                setSummary(data.summary);
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
        }
    };

    const handleExpenseAdded = () => {
        setShowAddExpense(false);
        fetchExpenses();
        fetchBalances();
    };

    const handleExpenseDeleted = () => {
        fetchExpenses();
        fetchBalances();
    };

    // Calculate summary stats
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const myExpenses = expenses.filter(exp => exp.paid_by === localStorage.getItem('userId'));
    const totalPaid = myExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const userId = localStorage.getItem('userId');
    const iOwe = balances
        .filter(b => b.fromUser === userId || b.from_user === userId)
        .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    const owedToMe = balances
        .filter(b => b.toUser === userId || b.to_user === userId)
        .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

    const categories = ['all', 'food', 'transport', 'accommodation', 'activities', 'entertainment', 'other'];

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading expenses...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '75rem', margin: '0 auto' }}>
            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {/* Total Expenses */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DollarSign size={20} color="#fff" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Total Expenses
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                ${totalExpenses.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* You Paid */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUp size={20} color="#fff" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                You Paid
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                ${totalPaid.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* You Owe */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '8px',
                            background: iOwe > 0 ? 'linear-gradient(135deg, #fa709a, #fee140)' : 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingDown size={20} color={iOwe > 0 ? '#fff' : 'var(--text-tertiary)'} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                You Owe
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: iOwe > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                                ${iOwe.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Owed to You */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '8px',
                            background: owedToMe > 0 ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Users size={20} color={owedToMe > 0 ? '#fff' : 'var(--text-tertiary)'} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Owed to You
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: owedToMe > 0 ? '#10b981' : 'var(--text-primary)' }}>
                                ${owedToMe.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Summary */}
            {balances.length > 0 && (
                <BalanceSummary
                    balances={balances}
                    eventId={eventId}
                    onSettled={fetchBalances}
                />
            )}

            {/* Header with Add Button and Filters */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Expenses
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Category Filter */}
                    <select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setTimeout(fetchExpenses, 100);
                        }}
                        className="input"
                        style={{ width: 'auto', minWidth: '150px' }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Expense List */}
            <ExpenseList
                expenses={expenses}
                eventId={eventId}
                onExpenseDeleted={handleExpenseDeleted}
            />

            {/* Add Expense Modal */}
            {showAddExpense && (
                <AddExpenseModal
                    eventId={eventId}
                    event={event}
                    onClose={() => setShowAddExpense(false)}
                    onExpenseAdded={handleExpenseAdded}
                />
            )}
        </div>
    );
};

export default ExpensesDashboard;
