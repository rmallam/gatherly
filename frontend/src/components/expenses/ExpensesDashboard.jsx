import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import { Plus, Receipt, SlidersHorizontal, Users } from 'lucide-react';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import BalanceSummary from './BalanceSummary';
import ExpenseDetail from './ExpenseDetail';
import './Expenses.css';

const ExpensesDashboard = ({ eventId, event }) => {
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [editExpenseData, setEditExpenseData] = useState(null);
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

    // Check if user has outstanding balances
    const userBalance = balances.find(b => b.userId === userId) || { balance: 0 };
    const isSettledUp = Math.abs(userBalance.balance) < 0.01;

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8e8e93' }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ color: 'white' }}>
            {/* Settled up summary */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0 0 16px 0'
            }}>
                <span style={{ fontSize: '0.9rem', color: isSettledUp ? '#8e8e93' : (userBalance.balance > 0 ? '#10b981' : '#ff453a') }}>
                    {isSettledUp ? 'You are all settled up!' : `You ${userBalance.balance > 0 ? 'are owed' : 'owe'} $${Math.abs(userBalance.balance).toFixed(2)}`}
                </span>
                <button style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', padding: 0 }}>
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            {/* Tabs - Minimalist Dark Mode */}
            <div style={{
                display: 'flex',
                gap: '24px',
                marginBottom: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => setActiveTab('expenses')}
                    style={{
                        padding: '0 0 12px 0',
                        border: 'none',
                        background: 'none',
                        color: activeTab === 'expenses' ? 'white' : '#8e8e93',
                        fontWeight: activeTab === 'expenses' ? 600 : 500,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'expenses' ? '2px solid #10b981' : '2px solid transparent',
                        transition: 'all 0.2s'
                    }}
                >
                    Expenses
                </button>
                <button
                    onClick={() => setActiveTab('balances')}
                    style={{
                        padding: '0 0 12px 0',
                        border: 'none',
                        background: 'none',
                        color: activeTab === 'balances' ? 'white' : '#8e8e93',
                        fontWeight: activeTab === 'balances' ? 600 : 500,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'balances' ? '2px solid #10b981' : '2px solid transparent',
                        transition: 'all 0.2s'
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
                        onExpenseClick={(expense) => setSelectedExpense(expense)}
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

            {/* Spacer for FAB */}
            <div style={{ height: 100 }} />

            {/* Flat Teal FAB */}
            <button className="teal-fab" onClick={() => {
                setEditExpenseData(null);
                setShowAddModal(true);
            }}>
                <Receipt size={20} />
                Add expense
            </button>

            {showAddModal && (
                <AddExpenseModal
                    eventId={eventId}
                    event={event}
                    initialData={editExpenseData}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditExpenseData(null);
                    }}
                    onExpenseAdded={() => {
                        fetchExpenses();
                        fetchBalances();
                        setShowAddModal(false);
                        setEditExpenseData(null);
                    }}
                />
            )}

            {/* Expense Detail Modal */}
            {selectedExpense && (
                <ExpenseDetail
                    expense={selectedExpense}
                    eventId={eventId}
                    currentUserId={userId}
                    participants={(() => {
                        const owner = {
                            id: event.user_id,
                            name: event.user_name || 'Event Owner',
                            isOwner: true
                        };
                        const guests = (event.guests || []).map(g => ({
                            id: g.user_id || g.id,
                            name: g.name,
                            email: g.email,
                            phone: g.phone
                        }));
                        return [owner, ...guests];
                    })()}
                    onClose={() => setSelectedExpense(null)}
                    onEdit={(expense) => {
                        setSelectedExpense(null);
                        setEditExpenseData(expense);
                        setShowAddModal(true);
                    }}
                    onDelete={() => {
                        fetchExpenses();
                        fetchBalances();
                        setSelectedExpense(null);
                    }}
                />
            )}
        </div>
    );
};

export default ExpensesDashboard;
