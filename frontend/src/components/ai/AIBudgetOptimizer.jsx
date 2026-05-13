import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Loader, TrendingDown, AlertCircle } from 'lucide-react';
import { CountrySelector, AIHeader } from './AICommon';
import { formatCurrency } from '../../utils/currencyUtils';
import FeatureLock from '../FeatureLock';

const AIBudgetOptimizer = ({ event, budget, expenses }) => {
    const { API_URL } = useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    // Use event country or default to 'US'
    const eventCountry = event.country || 'US';

    const fetchBudgetSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/ai/budget-suggestions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    guestCount: event.guest_count || 100,
                    budget: budget?.total_budget || 5000,
                    country: eventCountry
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get suggestions');
            }

            const data = await response.json();
            setSuggestions(data.suggestions);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FeatureLock featureName="Smart Budget Optimizer" description="Upgrade to Pro to unlock AI-powered budget analysis and cost saving strategies.">
        <div style={{ background: 'var(--card-bg-primary)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <AIHeader
                title="Smart Budget Optimizer"
                description="Get AI-powered cost estimates, savings tips, and market comparisons for your location."
                badge="AI Finance"
            />



            {!suggestions && !loading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <button
                        onClick={fetchBudgetSuggestions}
                        className="btn btn-primary"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green for money
                            border: 'none',
                            padding: '0.75rem 2rem',
                            fontSize: '1rem'
                        }}
                    >
                        <Sparkles size={18} style={{ marginRight: '8px' }} />
                        Analyze Budget
                    </button>
                    <p style={{ marginTop: '1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Get breakdown and savings tips
                    </p>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader className="spin" size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Analyzing market rates...</p>
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {suggestions && !loading && (
                <div className="fade-in-up">
                    {/* Budget Summary Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#059669' }}>Recommended Range</h4>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>
                                {formatCurrency(suggestions.recommendedBudget.min, event.country)} - {formatCurrency(suggestions.recommendedBudget.max, event.country)}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            {suggestions.recommendedBudget.reasoning}
                        </p>
                    </div>

                    {/* Category Breakdown */}
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Category Breakdown</h4>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '2rem' }}>
                        {Array.isArray(suggestions.categories) && suggestions.categories.map((cat, idx) => (
                            <div key={idx} style={{
                                background: 'var(--bg-secondary)',
                                padding: '1rem',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${idx % 2 === 0 ? '#6366f1' : '#ec4899'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(cat.amount, event.country)}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                                    {cat.percentage}% of total
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cat.reasoning}</p>
                                <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.5rem', fontWeight: 500 }}>
                                    💡 Tip: {cat.tip}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Savings Tips */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingDown size={18} color="#10b981" />
                            Cost Saving Opportunities
                        </h4>
                        <ul style={{ background: 'var(--bg-secondary)', padding: '1.5rem 2rem', borderRadius: '12px', margin: 0 }}>
                            {suggestions.savingsTips.map((tip, idx) => (
                                <li key={idx} style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{tip}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Insights */}
                    {suggestions.insights && (
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Market Insights</h4>
                            <ul style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--primary)', padding: '1.5rem 2rem', borderRadius: '12px', margin: 0 }}>
                                {suggestions.insights.map((insight, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{insight}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button onClick={fetchBudgetSuggestions} className="btn btn-text" style={{ fontSize: '0.9rem' }}>
                            Re-analyze Budget
                        </button>
                    </div>
                </div>
            )}
        </div>
        </FeatureLock>
    );
};

export default AIBudgetOptimizer;
