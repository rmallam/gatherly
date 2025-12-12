import React from 'react';

const PasswordStrength = ({ password }) => {
    const getStrength = () => {
        if (!password) return { score: 0, label: 'None', color: '#6b7280', width: '0%' };

        let score = 0;

        // Length
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        // Character variety
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        const levels = [
            { score: 0, label: 'None', color: '#6b7280', width: '0%' },
            { score: 1, label: 'Very Weak', color: '#ef4444', width: '20%' },
            { score: 2, label: 'Weak', color: '#f97316', width: '40%' },
            { score: 3, label: 'Fair', color: '#eab308', width: '60%' },
            { score: 4, label: 'Good', color: '#22c55e', width: '80%' },
            { score: 5, label: 'Strong', color: '#10b981', width: '100%' }
        ];

        const actualScore = Math.min(score, 5);
        return levels[actualScore];
    };

    const strength = getStrength();

    const requirements = [
        { met: password.length >= 8, text: '8+ characters' },
        { met: /[A-Z]/.test(password), text: 'Uppercase letter' },
        { met: /[a-z]/.test(password), text: 'Lowercase letter' },
        { met: /[0-9]/.test(password), text: 'Number' },
        { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'Special character' }
    ];

    return (
        <div style={{ marginTop: '0.5rem' }}>
            {/* Strength Bar */}
            <div style={{ marginBottom: '0.5rem' }}>
                <div style={{
                    height: '4px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: strength.width,
                        backgroundColor: strength.color,
                        transition: 'all 0.3s ease'
                    }} />
                </div>
                {password && (
                    <div style={{
                        fontSize: '0.75rem',
                        color: strength.color,
                        fontWeight: 600,
                        marginTop: '0.25rem'
                    }}>
                        {strength.label}
                    </div>
                )}
            </div>

            {/* Requirements Checklist */}
            {password && (
                <div style={{
                    fontSize: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.25rem',
                    marginTop: '0.5rem'
                }}>
                    {requirements.map((req, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: req.met ? '#10b981' : 'var(--text-secondary)'
                            }}
                        >
                            <span>{req.met ? '✓' : '○'}</span>
                            <span>{req.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PasswordStrength;
