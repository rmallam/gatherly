import React, { useState } from 'react';
import { Palette, Loader, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CountrySelector, AIHeader } from './AICommon';

const AIDecorPlanner = ({ event, onAddItems }) => {
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
            const response = await fetch(`${API_URL}/events/${event.id}/ai/decor-ideas`, {
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
            setSuggestions(data.decor);
        } catch (err) {
            console.error('AI Suggestion Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (item, type = 'decor') => {
        const newItem = {
            name: item.items || item.name, // Handle different formats from AI
            category: item.category ? item.category.toLowerCase() : 'decoration',
            quantity: 1,
            cost: item.cost || 0,
            vendor: '',
            status: 'planned'
        };

        onAddItems([newItem]);
    };

    return (
        <div style={{ background: 'var(--card-bg-primary)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <AIHeader
                title="AI Decor Stylist"
                description="Discover themes and decor ideas perfectly matched to your venue, season, and location."
                badge="AI Stylist"
            />



            {!suggestions && !loading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <button
                        onClick={fetchSuggestions}
                        className="btn btn-primary"
                        style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)', // Pink gradient for decor
                            border: 'none',
                            padding: '0.75rem 2rem',
                            fontSize: '1rem'
                        }}
                    >
                        <Sparkles size={18} style={{ marginRight: '8px' }} />
                        Generate Decor Themes
                    </button>
                    <p style={{ marginTop: '1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Get color palettes, item lists, and DIY tips
                    </p>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader className="spin" size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Styling your event...</p>
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
                    {/* Theme Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{suggestions.theme}</h4>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>{suggestions.description}</p>
                    </div>

                    {/* Color Palette */}
                    {suggestions.colorPalette && (
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            {suggestions.colorPalette.map((color, idx) => {
                                // Extract hex code if present, otherwise approximate
                                const hexMatch = color.match(/#[0-9A-Fa-f]{6}/);
                                const bg = hexMatch ? hexMatch[0] : 'var(--bg-secondary)';
                                return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: bg, border: '1px solid rgba(0,0,0,0.1)' }}></div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{color.split('(')[0].trim()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {/* Suggested Items */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                Recommended Items
                            </h4>
                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                                {Array.isArray(suggestions.decorItems) && suggestions.decorItems.map((item, idx) => (
                                    <div key={idx} style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.category}</span>
                                                <span style={{ fontWeight: 600 }}>${item.cost}</span>
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{item.items}</div>
                                            {item.diyTip && (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                    💡 {item.diyTip}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddItem(item)}
                                            className="btn btn-secondary"
                                            style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                                        >
                                            <Plus size={14} style={{ marginRight: '6px' }} /> Add to List
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shopping List */}
                        {suggestions.shoppingList && (
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Shopping List</h4>
                                <ul style={{ background: 'var(--bg-secondary)', padding: '1.5rem 2rem', borderRadius: '12px', margin: 0 }}>
                                    {suggestions.shoppingList.map((item, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Savings Tips */}
                        {suggestions.savingsTips && (
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>DIY & Savings</h4>
                                <ul style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--primary)', padding: '1.5rem 2rem', borderRadius: '12px', margin: 0 }}>
                                    {suggestions.savingsTips.map((tip, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button onClick={fetchSuggestions} className="btn btn-text" style={{ fontSize: '0.9rem' }}>
                            Try Another Theme
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIDecorPlanner;
