import React, { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import API_URL from '../../config/api';
import UpgradeModal from '../UpgradeModal';

const AIGiftsGenerator = ({ event, onGiftsGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please describe what kind of gifts you are looking for.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/gifts/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) {
                const errorData = await res.json();

                // Catch Pro Tier restriction
                if (res.status === 403 && errorData.error?.includes('Pro subscription required')) {
                    setUpgradeReason(errorData.message || 'Upgrade to Pro to auto-generate gift registries');
                    setShowUpgradeModal(true);
                    return;
                }

                throw new Error(errorData.error || 'Failed to generate gifts');
            }

            // Successfully generated and inserted into DB. Refresh parent.
            setPrompt('');
            if (onGiftsGenerated) {
                onGiftsGenerated();
            }

        } catch (err) {
            console.error('AI Gifts Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '10px' }}>
                    <Sparkles size={22} color="#a855f7" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    AI Gift Registry
                </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                Generate a curated list of highly-rated gift ideas tailored to this event and the demographics of your guests.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'Suggest some fun return gifts for a 5-year-old superhero birthday party under $10 each'"
                    className="modern-input"
                    style={{
                        minHeight: '100px',
                        resize: 'vertical',
                    }}
                    disabled={loading}
                />

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '12px' }}>{error}</div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '15px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                    }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    {loading ? (
                        <><Loader size={18} className="animate-spin" /> Curating Gifts...</>
                    ) : (
                        <><Sparkles size={18} /> Auto-Generate Registry</>
                    )}
                </button>
            </div>

            {/* Pro Paywall Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                triggerReason={upgradeReason}
            />
        </div>
    );
};

export default AIGiftsGenerator;
