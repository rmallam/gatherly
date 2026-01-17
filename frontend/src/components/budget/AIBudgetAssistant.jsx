import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Loader, ChefHat, Palette, TrendingDown, AlertCircle } from 'lucide-react';

const AIBudgetAssistant = ({ event, budget, expenses }) => {
    const { API_URL } = useApp();
    const [activeTab, setActiveTab] = useState('budget');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [menuData, setMenuData] = useState(null);
    const [decorData, setDecorData] = useState(null);
    const [optimizationData, setOptimizationData] = useState(null);

    const tabs = [
        { id: 'budget', label: 'Budget Builder', icon: Sparkles },
        { id: 'menu', label: 'Menu Ideas', icon: ChefHat },
        { id: 'decor', label: 'Decor', icon: Palette },
        { id: 'optimize', label: 'Optimize', icon: TrendingDown }
    ];

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
                    budget: budget?.total_budget || 5000
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

    const fetchMenuSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/ai/menu-suggestions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    guestCount: event.guest_count || 100,
                    cateringBudget: 2500,
                    cuisine: 'Mixed'
                })
            });

            if (!response.ok) throw new Error('Failed to get menu suggestions');
            const data = await response.json();
            setMenuData(data.menu);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDecorIdeas = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/ai/decor-ideas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    decorBudget: 800,
                    venueType: 'Indoor',
                    season: 'Spring'
                })
            });

            if (!response.ok) throw new Error('Failed to get decor ideas');
            const data = await response.json();
            setDecorData(data.decor);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptimization = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${event.id}/ai/cost-optimization`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    daysUntil: 60
                })
            });

            if (!response.ok) throw new Error('Failed to get optimization');
            const data = await response.json();
            setOptimizationData(data.optimization);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setError(null);

        // Fetch data for the selected tab if not already loaded
        if (tabId === 'budget' && !suggestions) {
            fetchBudgetSuggestions();
        } else if (tabId === 'menu' && !menuData) {
            fetchMenuSuggestions();
        } else if (tabId === 'decor' && !decorData) {
            fetchDecorIdeas();
        } else if (tabId === 'optimize' && !optimizationData) {
            fetchOptimization();
        }
    };

    const formatCurrency = (value) => {
        return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Sparkles size={24} color="white" />
                </div>
                <div>
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0
                    }}>
                        AI Budget Assistant
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        Powered by Google Gemini
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                overflowX: 'auto',
                paddingBottom: '8px'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div style={{ minHeight: '300px' }}>
                {loading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 20px',
                        gap: '16px'
                    }}>
                        <Loader size={40} className="animate-spin" color="var(--primary)" />
                        <p style={{ color: 'var(--text-secondary)' }}>
                            AI is analyzing your event...
                        </p>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <AlertCircle size={24} color="#ef4444" />
                        <div>
                            <p style={{ fontWeight: 600, color: '#ef4444', margin: 0 }}>
                                Error
                            </p>
                            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && activeTab === 'budget' && suggestions && (
                    <BudgetSuggestionsView suggestions={suggestions} formatCurrency={formatCurrency} />
                )}

                {!loading && !error && activeTab === 'menu' && menuData && (
                    <MenuSuggestionsView menuData={menuData} formatCurrency={formatCurrency} />
                )}

                {!loading && !error && activeTab === 'decor' && decorData && (
                    <DecorIdeasView decorData={decorData} formatCurrency={formatCurrency} />
                )}

                {!loading && !error && activeTab === 'optimize' && optimizationData && (
                    <OptimizationView optimizationData={optimizationData} formatCurrency={formatCurrency} />
                )}

                {!loading && !error && !suggestions && !menuData && !decorData && !optimizationData && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--text-secondary)'
                    }}>
                        <p>Click a tab to get AI-powered recommendations</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Budget Suggestions View Component
const BudgetSuggestionsView = ({ suggestions, formatCurrency }) => (
    <div>
        {/* Recommended Budget */}
        <div style={{
            padding: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
        }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                💡 Recommended Budget
            </h4>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                {formatCurrency(suggestions.recommendedBudget.min)} - {formatCurrency(suggestions.recommendedBudget.max)}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                {suggestions.recommendedBudget.reasoning}
            </p>
        </div>

        {/* Category Breakdown */}
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            📊 Category Breakdown
        </h4>
        {suggestions.categories.map((category, index) => (
            <div
                key={index}
                style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    marginBottom: '12px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{category.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(category.amount)} ({category.percentage}%)
                    </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                    {category.reasoning}
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                    <span style={{ color: '#10b981' }}>📈 {category.marketComparison}</span>
                    {category.tip && <span style={{ color: 'var(--text-secondary)' }}>💡 {category.tip}</span>}
                </div>
            </div>
        ))}

        {/* Savings Tips */}
        {suggestions.savingsTips && suggestions.savingsTips.length > 0 && (
            <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                    💰 Cost-Saving Tips
                </h4>
                {suggestions.savingsTips.map((tip, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                        }}
                    >
                        • {tip}
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Menu Suggestions View Component  
const MenuSuggestionsView = ({ menuData, formatCurrency }) => (
    <div>
        {/* Cost Summary */}
        <div style={{
            padding: '20px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        Total Cost
                    </h4>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6', marginTop: '4px' }}>
                        {formatCurrency(menuData.costBreakdown.total)}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Per Person</p>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(menuData.costBreakdown.costPerPerson)}
                    </div>
                </div>
            </div>
        </div>

        {/* Menu Items */}
        {['appetizers', 'mains', 'desserts', 'beverages'].map(category => {
            const items = menuData.menu[category];
            if (!items || items.length === 0) return null;

            return (
                <div key={category} style={{ marginBottom: '24px' }}>
                    <h4 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '12px',
                        textTransform: 'capitalize'
                    }}>
                        {category}
                    </h4>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '16px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '12px',
                                marginBottom: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                                <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{formatCurrency(item.cost)}</span>
                            </div>
                            {item.description && (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
        })}

        {/* Dietary Accommodations */}
        {menuData.dietaryAccommodations && menuData.dietaryAccommodations.length > 0 && (
            <div style={{
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                marginTop: '20px'
            }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    🥗 Dietary Accommodations
                </h4>
                {menuData.dietaryAccommodations.map((item, index) => (
                    <p key={index} style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                        • {item}
                    </p>
                ))}
            </div>
        )}
    </div>
);

// Decor Ideas View Component
const DecorIdeasView = ({ decorData, formatCurrency }) => (
    <div>
        {/* Theme */}
        <div style={{
            padding: '20px',
            background: 'rgba(236, 72, 153, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
        }}>
            <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                🎨 {decorData.theme}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                {decorData.description}
            </p>

            {/* Color Palette */}
            <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Color Palette:
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {decorData.colorPalette.map((color, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: color.match(/#[0-9A-F]{6}/i)?.[0] || color,
                                border: '2px solid var(--border-color)'
                            }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {color.split('(')[0].trim()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Decor Items */}
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            🛍️ Shopping List
        </h4>
        {decorData.decorItems.map((item, index) => (
            <div
                key={index}
                style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    marginBottom: '12px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.category}</span>
                    <span style={{ fontWeight: 700, color: '#ec4899' }}>{formatCurrency(item.cost)}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                    {item.items}
                </p>
                {item.diyTip && (
                    <div style={{
                        padding: '8px 12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#10b981'
                    }}>
                        💡 {item.diyTip}
                    </div>
                )}
            </div>
        ))}

        {/* Total */}
        <div style={{
            padding: '16px',
            background: 'rgba(236, 72, 153, 0.1)',
            borderRadius: '12px',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Budget</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#ec4899' }}>
                {formatCurrency(decorData.totalCost)}
            </span>
        </div>
    </div>
);

// Optimization View Component
const OptimizationView = ({ optimizationData, formatCurrency }) => (
    <div>
        {/* Analysis */}
        <div style={{
            padding: '20px',
            background: optimizationData.analysis.status === 'over-budget'
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
        }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                📊 Budget Analysis
            </h4>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                Projected: {formatCurrency(optimizationData.analysis.projectedFinal)}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                {optimizationData.analysis.alert}
            </p>
        </div>

        {/* Savings Opportunities */}
        {optimizationData.savingsOpportunities && optimizationData.savingsOpportunities.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                    💰 Savings Opportunities
                </h4>
                {optimizationData.savingsOpportunities.map((opp, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '16px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            marginBottom: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{opp.category}</span>
                            <span style={{ fontWeight: 700, color: '#10b981' }}>Save {formatCurrency(opp.savings)}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                            {opp.suggestion}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                            Impact: {opp.impact}
                        </p>
                    </div>
                ))}
            </div>
        )}

        {/* Recommendations */}
        {optimizationData.recommendations && optimizationData.recommendations.length > 0 && (
            <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                    ✨ Recommendations
                </h4>
                {optimizationData.recommendations.map((rec, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                        }}
                    >
                        • {rec}
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default AIBudgetAssistant;
