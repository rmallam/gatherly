import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import BalanceSummary from './BalanceSummary';

const ExpensesDashboard = ({ eventId, event }) => {
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('expenses'); // expenses, balances


    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events/${eventId}/expenses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setExpenses(data.expenses || []);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
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
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchExpenses(), fetchBalances()]);
            setLoading(false);
        };
        loadData();
    }, [eventId]);

    // Get userId from JWT token
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || payload.userId;
        } catch (e) {
            console.error('Error parsing token:', e);
            return null;
        }
    };
    const userId = getUserIdFromToken();

    // Calculate summary stats
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const yourExpenses = expenses
        .filter(exp => exp.paid_by === userId || exp.paid_by_id === userId)
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const iOwe = balances
        .filter(b => (b.fromUser === userId || b.from_user === userId) && parseFloat(b.amount) > 0)
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    const owedToMe = balances
        .filter(b => (b.toUser === userId || b.to_user === userId) && parseFloat(b.amount) > 0)
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading expenses...
            </div>
        );
    }

    return (
        <div>
            {/* Summary Banner */}
            <div style={{
                padding: '1.5rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem'
            }}>
                {owedToMe > iOwe ? (
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#10b981' }}>
                        You are owed ${(owedToMe - iOwe).toFixed(2)}
                    </div>
                ) : iOwe > owedToMe ? (
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ef4444' }}>
                        You owe ${(iOwe - owedToMe).toFixed(2)}
                    </div>
                ) : (
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        You are all settled up
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.5rem'
            }}>
                <button
                    onClick={() => setActiveTab('expenses')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        background: activeTab === 'expenses' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'expenses' ? 'white' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Expenses
                </button>
                <button
                    onClick={() => setActiveTab('balances')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        background: activeTab === 'balances' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'balances' ? 'white' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Balances
                </button>
            </div>

            {/* Add Expense Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
                style={{
                    marginBottom: '1.5rem',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem'
                }}
            >
                <Plus size={20} />
                Add Expense
            </button>

            {/* Content */}
            {activeTab === 'expenses' ? (
                <ExpenseList
                    expenses={expenses}
                    eventId={eventId}
                    onExpenseDeleted={() => {
                        fetchExpenses();
                        fetchBalances();
                    }}
                    userId={userId}
                />
            ) : (
                <BalanceSummary
                    balances={balances}
                    eventId={eventId}
                    onSettled={() => {
                        fetchBalances();
                        fetchExpenses();
                    }}
                />
            )}

            {/* Add Expense Modal */}
            {showAddModal && (
                <AddExpenseModal
                    eventId={eventId}
                    event={event}
                    onClose={() => setShowAddModal(false)}
                    onExpenseAdded={() => {
                        fetchExpenses();
                        fetchBalances();
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ExpensesDashboard;
