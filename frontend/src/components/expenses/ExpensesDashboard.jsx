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
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-secondary)'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
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
                    color: 'var(--text-primary)'
                }}>
                    Expenses
                </h2>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.9375rem'
                    }}
                >
                    <Plus size={18} />
                    Add Expense
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                background: 'var(--bg-secondary)',
                padding: '0.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border)'
            }}>
                <button
                    onClick={() => setActiveTab('expenses')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'expenses' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'expenses' ? 'white' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Expenses
                </button>
                <button
                    onClick={() => setActiveTab('balances')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'balances' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'balances' ? 'white' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Balances
                </button>
            </div>

            {/* Content */}
            <div>
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
