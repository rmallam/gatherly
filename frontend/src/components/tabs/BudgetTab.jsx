import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, Plus, Trash2, Edit2, Check, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const CATEGORIES = [
    'Venue',
    'Catering',
    'Decorations',
    'Entertainment',
    'Photography',
    'Transportation',
    'Gifts',
    'Misc'
];

const BudgetTab = ({ event }) => {
    const { API_URL, token } = useApp();
    const [budget, setBudget] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    // Budget form
    const [totalBudget, setTotalBudget] = useState('');
    const [showBudgetForm, setShowBudgetForm] = useState(false);

    // Expense form
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [expenseForm, setExpenseForm] = useState({
        category: 'Venue',
        description: '',
        amount: '',
        vendor: '',
        paid: false,
        date: new Date().toISOString().split('T')[0]
    });

    // Fetch data
    useEffect(() => {
        if (event?.id) {
            fetchBudgetData();
        }
    }, [event?.id]);

    const fetchBudgetData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch budget
            const budgetRes = await fetch(`${API_URL}/api/events/${event.id}/budget`, { headers });
            if (budgetRes.ok) {
                const budgetData = await budgetRes.json();
                setBudget(budgetData);
                if (budgetData) {
                    setTotalBudget(budgetData.total_budget);
                }
            }

            // Fetch expenses
            const expensesRes = await fetch(`${API_URL}/api/events/${event.id}/expenses`, { headers });
            if (expensesRes.ok) {
                const expensesData = await expensesRes.json();
                setExpenses(expensesData);
            }

            // Fetch summary
            const summaryRes = await fetch(`${API_URL}/api/events/${event.id}/expenses/summary`, { headers });
            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setSummary(summaryData);
            }

        } catch (error) {
            console.error('Error fetching budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBudget = async () => {
        try {
            const response = await fetch(`${API_URL}/api/events/${event.id}/budget`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ total_budget: parseFloat(totalBudget) })
            });

            if (response.ok) {
                setShowBudgetForm(false);
                fetchBudgetData();
            }
        } catch (error) {
            console.error('Error creating budget:', error);
        }
    };

    const handleUpdateBudget = async () => {
        try {
            const response = await fetch(`${API_URL}/api/events/${event.id}/budget`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ total_budget: parseFloat(totalBudget) })
            });

            if (response.ok) {
                fetchBudgetData();
            }
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };

    const handleSaveExpense = async () => {
        try {
            const url = editingExpense
                ? `${API_URL}/api/events/${event.id}/expenses/${editingExpense.id}`
                : `${API_URL}/api/events/${event.id}/expenses`;

            const response = await fetch(url, {
                method: editingExpense ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...expenseForm,
                    amount: parseFloat(expenseForm.amount)
                })
            });

            if (response.ok) {
                setShowExpenseForm(false);
                setEditingExpense(null);
                setExpenseForm({
                    category: 'Venue',
                    description: '',
                    amount: '',
                    vendor: '',
                    paid: false,
                    date: new Date().toISOString().split('T')[0]
                });
                fetchBudgetData();
            }
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!confirm('Delete this expense?')) return;

        try {
            await fetch(`${API_URL}/api/events/${event.id}/expenses/${expenseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchBudgetData();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const startEditExpense = (expense) => {
        setEditingExpense(expense);
        setExpenseForm({
            category: expense.category,
            description: expense.description || '',
            amount: expense.amount,
            vendor: expense.vendor || '',
            paid: expense.paid,
            date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
        setShowExpenseForm(true);
    };

    const budgetPercentage = summary ? ((summary.total_spent / summary.total_budget) * 100) : 0;
    const isOverBudget = budgetPercentage > 100;

    if (loading) {
        return <div className="text-center py-8">Loading budget...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Budget Overview */}
            {budget ? (
                <div className="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Budget Overview</h3>
                        <button
                            onClick={() => {
                                setTotalBudget(budget.total_budget);
                                setShowBudgetForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            <Edit2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Budget</p>
                            <p className="text-2xl font-bold text-gray-900">${summary?.total_budget?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Spent</p>
                            <p className="text-2xl font-bold text-orange-600">${summary?.total_spent?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Remaining</p>
                            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                ${summary?.remaining?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className={isOverBudget ? 'text-red-600 font-bold' : ''}>{budgetPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {summary?.guest_count > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign size={16} />
                            <span>Cost per guest: <strong>${summary.cost_per_guest}</strong> ({summary.guest_count} guests)</span>
                        </div>
                    )}

                    {isOverBudget && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle size={18} />
                            <span className="text-sm font-medium">You are over budget!</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card p-6 text-center">
                    <p className="text-gray-600 mb-4">No budget set for this event</p>
                    <button onClick={() => setShowBudgetForm(true)} className="btn btn-primary">
                        <Plus size={18} /> Set Budget
                    </button>
                </div>
            )}

            {/* Budget Form Modal */}
            {showBudgetForm && (
                <div className="card p-6 bg-blue-50 border-2 border-blue-200">
                    <h4 className="font-bold mb-4">{budget ? 'Update Budget' : 'Set Budget'}</h4>
                    <div className="flex gap-4">
                        <input
                            type="number"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(e.target.value)}
                            placeholder="Total budget..."
                            className="form-input flex-1"
                        />
                        <button onClick={budget ? handleUpdateBudget : handleCreateBudget} className="btn btn-primary">
                            <Check size={18} /> Save
                        </button>
                        <button onClick={() => setShowBudgetForm(false)} className="btn btn-secondary">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {summary?.by_category && Object.keys(summary.by_category).length > 0 && (
                <div className="card p-6">
                    <h4 className="font-bold mb-4">Expenses by Category</h4>
                    <div className="space-y-3">
                        {Object.entries(summary.by_category).map(([category, amount]) => (
                            <div key={category} className="flex justify-between items-center">
                                <span className="font-medium">{category}</span>
                                <span className="text-gray-700 font-semibold">${parseFloat(amount).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Expense Button */}
            {budget && (
                <button
                    onClick={() => {
                        setEditingExpense(null);
                        setExpenseForm({
                            category: 'Venue',
                            description: '',
                            amount: '',
                            vendor: '',
                            paid: false,
                            date: new Date().toISOString().split('T')[0]
                        });
                        setShowExpenseForm(!showExpenseForm);
                    }}
                    className="btn btn-primary w-full"
                >
                    <Plus size={18} /> Add Expense
                </button>
            )}

            {/* Expense Form */}
            {showExpenseForm && (
                <div className="card p-6 bg-green-50 border-2 border-green-200">
                    <h4 className="font-bold mb-4">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h4>
                    <div className="space-y-4">
                        <select
                            value={expenseForm.category}
                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                            className="form-input"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            step="0.01"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                            placeholder="Amount"
                            className="form-input"
                        />

                        <input
                            type="text"
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                            placeholder="Description (optional)"
                            className="form-input"
                        />

                        <input
                            type="text"
                            value={expenseForm.vendor}
                            onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                            placeholder="Vendor (optional)"
                            className="form-input"
                        />

                        <input
                            type="date"
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                            className="form-input"
                        />

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={expenseForm.paid}
                                onChange={(e) => setExpenseForm({ ...expenseForm, paid: e.target.checked })}
                            />
                            <span>Paid</span>
                        </label>

                        <div className="flex gap-2">
                            <button onClick={handleSaveExpense} className="btn btn-primary flex-1">
                                <Check size={18} /> {editingExpense ? 'Update' : 'Add'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowExpenseForm(false);
                                    setEditingExpense(null);
                                }}
                                className="btn btn-secondary"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense List */}
            <div className="card p-6">
                <h4 className="font-bold mb-4">Expenses ({expenses.length})</h4>
                {expenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No expenses yet</p>
                ) : (
                    <div className="space-y-2">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <div className="flex-1">
                                    <p className="font-medium">{expense.category} - ${parseFloat(expense.amount).toFixed(2)}</p>
                                    {expense.description && <p className="text-sm text-gray-600">{expense.description}</p>}
                                    {expense.vendor && <p className="text-xs text-gray-500">Vendor: {expense.vendor}</p>}
                                    <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {expense.paid && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Paid</span>}
                                    <button onClick={() => startEditExpense(expense)} className="text-blue-600 hover:text-blue-800">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-800">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetTab;
