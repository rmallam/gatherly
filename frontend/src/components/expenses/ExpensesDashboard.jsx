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
    const [activeTab, setActiveTab] = useState('balances'); // Start with balances to show split view


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

    const iOwe = balances
        .filter(b => (b.fromUser === userId || b.from_user === userId) && parseFloat(b.amount) > 0)
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    const owedToMe = balances
        .filter(b => (b.toUser === userId || b.to_user === userId) && parseFloat(b.amount) > 0)
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    // Get avatar color based on name
    const getAvatarColor = (name) => {
        const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6)), url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'blur\'%3E%3CfeGaussianBlur stdDeviation=\'10\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' fill=\'%23667eea\' filter=\'url(%23blur)\'/%3E%3C/svg%3E")',
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
            padding: '2rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}>
            {/* Main Glassmorphism Card - Centered */}
            <div style={{
                width: '100%',
                maxWidth: '500px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderRadius: '28px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                padding: '2.5rem 2rem',
                color: 'white'
            }}>
                {/* Title */}
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    margin: '0 0 2rem 0',
                    color: 'white',
                    letterSpacing: '-0.5px'
                }}>
                    Split Money
                </h2>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    marginBottom: '2rem'
                }} />

                {/* Balance List */}
                <div style={{ marginBottom: '2.5rem' }}>
                    {balances.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                            No balances yet
                        </div>
                    ) : (
                        balances.slice(0, 3).map((balance, index) => {
                            const name = balance.to_user_name || balance.toUserName || 'User';
                            const amount = parseFloat(balance.amount || 0);

                            return (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.25rem 0',
                                    borderBottom: index < balances.slice(0, 3).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '50%',
                                            background: getAvatarColor(name),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: 'white',
                                            flexShrink: 0
                                        }}>
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Name */}
                                        <div style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 600,
                                            color: 'white'
                                        }}>
                                            {name}
                                        </div>
                                    </div>
                                    {/* Amount */}
                                    <div style={{
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: 'white'
                                    }}>
                                        ${amount.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    marginBottom: '2rem'
                }} />

                {/* Total */}
                <div style={{
                    textAlign: 'center',
                    fontSize: '4rem',
                    fontWeight: 800,
                    color: 'white',
                    letterSpacing: '-2px',
                    marginBottom: '1.5rem'
                }}>
                    ${totalExpenses.toFixed(0)}
                </div>

                {/* Add Expense Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '14px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'scale(0.98)';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <Plus size={20} />
                    Add Expense
                </button>

                {/* View All Link */}
                <button
                    onClick={() => setActiveTab(activeTab === 'balances' ? 'expenses' : 'balances')}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    {activeTab === 'balances' ? 'View All Expenses' : 'View Balances'}
                </button>
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

            {/* Full list view (hidden by default, shown when clicking "View All") */}
            {activeTab === 'expenses' && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    padding: '2rem',
                    overflowY: 'auto'
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <button
                            onClick={() => setActiveTab('balances')}
                            style={{
                                marginBottom: '1rem',
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            ← Back
                        </button>
                        <ExpenseList
                            expenses={expenses}
                            eventId={eventId}
                            onExpenseDeleted={() => {
                                fetchExpenses();
                                fetchBalances();
                            }}
                            userId={userId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesDashboard;
