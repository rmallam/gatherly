import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import { Plus } from 'lucide-react';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import BalanceSummary from './BalanceSummary';

const ExpensesDashboard = ({ eventId, event }) => {
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('expenses');

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

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(10,10,15,0.98), rgba(20,20,30,0.95))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 10
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(10,10,15,0.98), rgba(20,20,30,0.95))',
            zIndex: 10,
            overflowY: 'auto',
            padding: '1rem'
        }}>
            {/* Single Glassmorphism Container */}
            <div style={{
                width: '100%',
                maxWidth: '100%',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                padding: '1.25rem',
                color: 'white',
                minHeight: 'calc(100vh - 2rem)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem'
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

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.25rem',
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

                {/* Content */}
                <div style={{
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
