import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import { Plus, ScanLine, Loader, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import BalanceSummary from './BalanceSummary';
import ExpenseDetail from './ExpenseDetail';

const ExpensesDashboard = ({ eventId, event }) => {
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [activeTab, setActiveTab] = useState('expenses');

    // Receipt Scanning State
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const fileInputRef = React.useRef(null);
    const navigate = useNavigate();
    const { user } = useApp(); // Get user for pro check

    const handleScanClick = () => {
        // Check for Pro/Business tier
        const isPro = user?.subscription_tier === 'pro' || user?.subscription_tier === 'business';

        if (!isPro) {
            // Redirect to pro page or show upgrade alert
            if (confirm('Receipt Scanning is a Pro feature. Upgrade to unlock?')) {
                navigate('/pro');
            }
            return;
        }

        // Trigger file input
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
                const mimeType = file.type;

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/gemini/analyze-receipt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ image: base64Image, mimeType })
                });

                if (!response.ok) {
                    throw new Error('Failed to analyze receipt');
                }

                const data = await response.json();

                if (data.isReceipt) {
                    setScannedData(data); // Store AI results
                    setShowAddModal(true); // Open modal
                } else {
                    alert('Could not detect a valid receipt in this image.');
                }
            };
        } catch (error) {
            console.error('Scan error:', error);
            alert('Failed to analyze receipt. Please try again.');
        } finally {
            setIsScanning(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

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

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        capture="environment" // Prefer camera on mobile
                        onChange={handleFileSelect}
                    />

                    <button
                        onClick={handleScanClick}
                        disabled={isScanning}
                        className="btn btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            fontSize: '0.9375rem',
                            position: 'relative'
                        }}
                    >
                        {isScanning ? <Loader size={18} className="spin" /> : <ScanLine size={18} />}
                        {isScanning ? 'Analyzing...' : 'Scan Receipt'}
                        {/* Lock icon if not pro (optional visual cue) */}
                        {!(user?.subscription_tier === 'pro' || user?.subscription_tier === 'business') && (
                            <Lock size={12} style={{ position: 'absolute', top: -4, right: -4, color: '#d97706' }} />
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setScannedData(null); // Clear previous scan data
                            setShowAddModal(true);
                        }}
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
            </div>

            {/* Tabs - Simplified Styling */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => setActiveTab('expenses')}
                    style={{
                        padding: '0 0 12px 0',
                        border: 'none',
                        background: 'none',
                        color: activeTab === 'expenses' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'expenses' ? 700 : 500,
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'expenses' ? '2px solid var(--primary)' : '2px solid transparent',
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
                        color: activeTab === 'balances' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'balances' ? 700 : 500,
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'balances' ? '2px solid var(--primary)' : '2px solid transparent',
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

            {showAddModal && (
                <AddExpenseModal
                    eventId={eventId}
                    event={event}
                    initialData={scannedData} // Pass scanned data
                    onClose={() => {
                        setShowAddModal(false);
                        setScannedData(null);
                    }}
                    onExpenseAdded={() => {
                        fetchExpenses();
                        fetchBalances();
                        setShowAddModal(false);
                        setScannedData(null);
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
                        // Construct participants list (Owner + Guests)
                        const owner = {
                            id: event.user_id,
                            name: event.user_name || 'Event Owner',
                            isOwner: true
                        };
                        const guests = (event.guests || []).map(g => ({
                            id: g.user_id || g.id, // Handle both linked user_id and guest id
                            name: g.name,
                            email: g.email,
                            phone: g.phone
                        }));
                        // Deduplicate in case owner is also in guests list (shouldn't happen but good safety)
                        // But actually guests usually don't include owner unless explicitly added.
                        // We'll just combine them.
                        return [owner, ...guests];
                    })()}
                    onClose={() => setSelectedExpense(null)}
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
