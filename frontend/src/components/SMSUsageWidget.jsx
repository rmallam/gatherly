import React, { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, AlertCircle } from 'lucide-react';

const SMSUsageWidget = () => {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsage();
    }, []);

    const fetchUsage = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching SMS usage from API...');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sms/usage`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('SMS usage data:', data);
                setUsage(data);
            } else {
                console.error('SMS usage API error:', response.status);
                setError(`API error: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to fetch SMS usage:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading SMS usage...
                </div>
            </div>
        );
    }

    if (error || !usage) {
        return (
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MessageCircle size={20} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>SMS Usage</h3>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {error ? `Error loading SMS data: ${error}` : 'Unable to load SMS usage data'}
                </div>
            </div>
        );
    }

    const percentage = (usage.used / usage.limit) * 100;
    const isLow = usage.remaining < 10;
    const isVeryLow = usage.remaining < 5;

    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageCircle size={20} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>SMS Usage</h3>
                </div>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                }}>
                    {usage.tier?.toUpperCase() || 'FREE'}
                </span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{
                    height: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(percentage, 100)}%`,
                        background: isVeryLow ? '#ef4444' : isLow ? '#f59e0b' : 'var(--primary)',
                        transition: 'width 0.3s ease',
                        borderRadius: '999px'
                    }} />
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {usage.used} / {usage.limit}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        SMS sent this month
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: isVeryLow ? '#ef4444' : 'var(--text-primary)' }}>
                        {usage.remaining}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        remaining
                    </div>
                </div>
            </div>

            {/* Reset Date */}
            <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border)'
            }}>
                Resets on {new Date(usage.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Warning */}
            {isLow && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: isVeryLow ? '#fee2e2' : '#fef3c7',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                }}>
                    <AlertCircle size={16} style={{ color: isVeryLow ? '#dc2626' : '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem', color: isVeryLow ? '#991b1b' : '#92400e' }}>
                        {isVeryLow
                            ? 'Almost out of SMS! Upgrade your plan to continue sending messages.'
                            : 'Running low on SMS. Consider upgrading your plan.'}
                    </div>
                </div>
            )}

            {/* Upgrade Button */}
            {usage.tier === 'free' && (
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                    onClick={() => window.location.href = '/paywall'}
                >
                    <TrendingUp size={16} />
                    Upgrade Plan
                </button>
            )}
        </div>
    );
};

export default SMSUsageWidget;
