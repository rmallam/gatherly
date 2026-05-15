import React, { useState } from 'react';
import { Sparkles, Loader, X } from 'lucide-react';
import API_URL from '../../config/api';
import UpgradeModal from '../UpgradeModal';
import FeatureLock from '../FeatureLock';

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

    const [isOpen, setIsOpen] = useState(false);

    return (
        <FeatureLock featureName="AI Gift Registry" description="Upgrade to Pro to instantly curate a list of highly-rated gifts tailored to your event.">
            {/* Clickable Widget Card */}
            <div
                onClick={() => setIsOpen(true)}
                style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }}
            >
                <div style={{ padding: '12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px' }}>
                    <Sparkles size={24} color="#a855f7" />
                </div>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        AI Gift Registry
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Curate highly-rated gift ideas for your guests
                    </p>
                </div>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '16px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--bg-primary)',
                        borderRadius: '20px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        animation: 'modalSlideUp 0.3s ease-out'
                    }}>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '10px' }}>
                                <Sparkles size={22} color="#a855f7" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                AI Gift Registry
                            </h3>
                        </div>

                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
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
                                    <><Loader size={18} className="animate-spin" /> Analyzing demographics & curating gifts...</>
                                ) : (
                                    <><Sparkles size={18} /> Auto-Generate Registry</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pro Paywall Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                triggerReason={upgradeReason}
            />
        </FeatureLock>
    );
};

export default AIGiftsGenerator;
