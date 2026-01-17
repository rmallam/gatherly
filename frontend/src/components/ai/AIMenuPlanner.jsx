import React, { useState } from 'react';
import { ChefHat, Loader, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CountrySelector, AIHeader } from './AICommon';

const AIMenuPlanner = ({ event, onAddItems, styles }) => {
    const { API_URL } = useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    // Use event country or default to 'US'
    const eventCountry = event.country || 'US';

    const fetchSuggestions = async () => {
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
                    country: eventCountry
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || data.error || 'Failed to get suggestions');
            }

            const data = await response.json();
            setSuggestions(data.menu);
        } catch (err) {
            console.error('AI Suggestion Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (item, type = 'appetizer') => {
        // Map AI category to app category ID
        const categoryMap = {
            'appetizers': 'appetizer',
            'starters': 'appetizer',
            'mains': 'main',
            'main course': 'main',
            'desserts': 'dessert',
            'beverages': 'beverage',
            'drinks': 'beverage'
        };

        const newItem = {
            name: item.name,
            category: categoryMap[type.toLowerCase()] || 'other',
            quantity: typeof item.quantity === 'number' ? item.quantity : 1, // Default quantity
            servings: item.servings || item.quantity || 1,
            cost: item.cost || 0,
            vendor: '',
            status: 'planned'
        };

        onAddItems([newItem]);
    };

    return (
        <div style={{ background: 'var(--card-bg-primary)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <AIHeader
                title="AI Menu Planner"
                description="Get personalized menu recommendations based on your cuisine preferences and budget, tailored to your location."
                badge="AI Chef"
            />



            {!suggestions && !loading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <button
                        onClick={fetchSuggestions}
                        className="btn btn-primary"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            fontSize: '1rem'
                        }}
                    >
                        <Sparkles size={18} style={{ marginRight: '8px' }} />
                        Generate Menu Ideas
                    </button>
                    <p style={{ marginTop: '1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Uses Gemini AI to plan a complete menu
                    </p>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader className="spin" size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Chef AI is cooking up ideas...</p>
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
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Cost Breakdown */}
                        {suggestions.costBreakdown && (
                            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Estimated Costs</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Total: ${suggestions.costBreakdown.total}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>(${suggestions.costBreakdown.costPerPerson}/person)</span>
                                </div>
                            </div>
                        )}

                        {/* Menu Categories */}
                        {Object.entries(suggestions.menu)
                            .filter(([category]) => ['appetizers', 'starters', 'mains', 'main course', 'desserts', 'beverages', 'drinks'].includes(category.toLowerCase()))
                            .map(([category, items]) => (
                                <div key={category}>
                                    <h4 style={{
                                        textTransform: 'capitalize',
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        marginBottom: '1rem',
                                        borderBottom: '2px solid var(--border-color)',
                                        paddingBottom: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {category}
                                    </h4>
                                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                                        {Array.isArray(items) && items.map((item, idx) => (
                                            <div key={idx} style={{
                                                background: 'var(--bg-secondary)',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                gap: '0.75rem'
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                        <h5 style={{ fontWeight: 600, fontSize: '1rem' }}>{item.name}</h5>
                                                        <span style={{
                                                            background: 'var(--card-bg-primary)',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600
                                                        }}>${item.cost}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                        {item.description}
                                                    </p>
                                                    {item.servings && (
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                                            Serves: {item.servings}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleAddItem(item, category)}
                                                    className="btn btn-secondary"
                                                    style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                                                >
                                                    <Plus size={14} style={{ marginRight: '6px' }} /> Add to Menu
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        {/* Tips */}
                        {suggestions.tips && (
                            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Chef's Tips</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {suggestions.tips.map((tip, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button onClick={fetchSuggestions} className="btn btn-text" style={{ fontSize: '0.9rem' }}>
                                Regenerate Ideas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIMenuPlanner;
