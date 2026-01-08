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
            const response = await fetch(`${API_URL}/events/${eventId}/expenses`, {
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
            const response = await fetch(`${API_URL}/events/${eventId}/balances`, {
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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            padding: '1.5rem',
            position: 'relative'
        }}>
            {/* Glassmorphism Container */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                color: 'white'
            }}>
                {/* Summary Banner */}
                <div style={{
                    padding: '2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Your Balance
                    </div>
                    {owedToMe > iOwe ? (
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981' }}>
                            +${(owedToMe - iOwe).toFixed(2)}
                        </div>
                    ) : iOwe > owedToMe ? (
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fbbf24' }}>
                            -${(iOwe - owedToMe).toFixed(2)}
                        </div>
                    ) : (
                        <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                            $0.00
                        </div>
                    )}
                    <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        {owedToMe > iOwe ? 'You are owed' : iOwe > owedToMe ? 'You owe' : 'All settled up'}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.5rem',
                    borderRadius: '12px'
                }}>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        style={{
                            flex: 1,
                            padding: '0.875rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'expenses' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            backdropFilter: activeTab === 'expenses' ? 'blur(10px)' : 'none'
                        }}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('balances')}
                        style={{
                            flex: 1,
                            padding: '0.875rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'balances' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            backdropFilter: activeTab === 'balances' ? 'blur(10px)' : 'none'
                        }}
                    >
                        Balances
                    </button>
                </div>

                {/* Add Expense Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        marginBottom: '2rem',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1.125rem',
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Plus size={20} />
                    Add Expense
                </button>

                {/* Content with glassmorphism wrapper */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '1.5rem',
                    minHeight: '300px'
                }}>
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
                </div>
            </div>

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
