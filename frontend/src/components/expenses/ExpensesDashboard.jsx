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
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, rgba(20,20,30,0.95), rgba(40,40,60,0.9))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(20,20,30,0.95), rgba(40,40,60,0.9)), url("data:image/svg+xml,%3Csvg width=\'400\' height=\'400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'400\' height=\'400\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            padding: '1rem',
            position: 'relative'
        }}>
            {/* Main Glassmorphism Container */}
            <div style={{
                width: '100%',
                maxWidth: '700px',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                color: 'white'
            }}>
                {/* Header with Title and Add Button */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        margin: 0,
                        color: 'white'
                    }}>
                        Expenses
                    </h2>

                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'rgba(99, 102, 241, 0.3)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(99, 102, 241, 0.5)',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.25rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        style={{
                            flex: 1,
                            padding: '0.625rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'expenses' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
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
                            padding: '0.625rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'balances' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            backdropFilter: activeTab === 'balances' ? 'blur(10px)' : 'none'
                        }}
                    >
                        Balances
                    </button>
                </div>

                {/* Content Area - Clean and Spacious */}
                <div style={{
                    minHeight: '400px',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    wordBreak: 'normal',
                    wordWrap: 'normal',
                    whiteSpace: 'normal',
                    // Override CSS variables for white text theme
                    '--text-primary': 'rgba(255, 255, 255, 0.95)',
                    '--text-secondary': 'rgba(255, 255, 255, 0.7)',
                    '--text-tertiary': 'rgba(255, 255, 255, 0.5)',
                    '--bg-primary': 'rgba(255, 255, 255, 0.05)',
                    '--bg-secondary': 'rgba(255, 255, 255, 0.08)',
                    '--bg-tertiary': 'rgba(255, 255, 255, 0.12)',
                    '--border': 'rgba(255, 255, 255, 0.1)',
                    '--radius': '12px'
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
