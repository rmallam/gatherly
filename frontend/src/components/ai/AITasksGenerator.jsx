import React, { useState } from 'react';
import { Target, Loader } from 'lucide-react';
import API_URL from '../../config/api';
import UpgradeModal from '../UpgradeModal';

const AITasksGenerator = ({ event, onTasksGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please describe what you want the AI to plan for your event tasks.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/tasks/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) {
                const errorData = await res.json();

                if (res.status === 403 && errorData.error?.includes('Pro subscription required')) {
                    setUpgradeReason(errorData.message || 'Upgrade to Pro to auto-generate task timelines');
                    setShowUpgradeModal(true);
                    return;
                }

                throw new Error(errorData.error || 'Failed to generate tasks');
            }

            const data = await res.json();

            if (data.tasks && Array.isArray(data.tasks)) {
                // Ensure IDs and dates are properly added for the frontend state
                const newTasks = data.tasks.map(t => ({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    title: t.title,
                    category: ['planning', 'booking', 'day-of', 'post-event'].includes(t.category) ? t.category : 'planning',
                    priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
                    deadline: t.deadline || '',
                    status: 'not-started',
                    createdAt: new Date().toISOString()
                }));

                onTasksGenerated(newTasks);
                setPrompt('');
            } else {
                throw new Error('Received malformed data from AI');
            }

        } catch (err) {
            console.error('AI Tasks Error:', err);
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
                <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '10px' }}>
                    <Target size={22} color="#06b6d4" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Intelligent Task Breakdown
                </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                Auto-populate your checklist. Describe your plan and let the AI generate a logical timeline of tasks and relative deadlines.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'Draft a timeline for a 50-person corporate offsite in exactly 3 weeks'"
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
                        <><Loader size={18} className="animate-spin" /> Generating Timeline...</>
                    ) : (
                        <><Target size={18} /> Auto-Generate Checklist</>
                    )}
                </button>
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                triggerReason={upgradeReason}
            />
        </div>
    );
};

export default AITasksGenerator;
