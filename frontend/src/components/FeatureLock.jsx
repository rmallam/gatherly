import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureLock = ({
    children,
    featureName = 'Pro Feature',
    description = 'Upgrade to Pro to unlock this feature and take your events to the next level.',
    minTier = 'pro' // 'pro' | 'business'
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const hasAccess = () => {
        if (!user) return false;
        if (user.subscription_tier === 'business') return true;
        if (user.subscription_tier === 'pro' && minTier === 'pro') return true;
        return false;
    };

    if (hasAccess()) {
        return children;
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
            {/* Blured Content Background (Optional: could also just hide content) */}
            <div style={{
                filter: 'blur(8px)',
                opacity: 0.3,
                pointerEvents: 'none',
                userSelect: 'none',
                height: '100%',
                width: '100%',
                overflow: 'hidden'
            }}>
                {children}
            </div>

            {/* Lock Overlay */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(17, 24, 39, 0.95)',
                padding: '32px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
                maxWidth: '90%',
                width: '320px',
                backdropFilter: 'blur(12px)',
                zIndex: 50
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    padding: '16px',
                    borderRadius: '50%',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                    <Lock size={32} color="white" />
                </div>

                <h3 style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: '8px'
                }}>
                    {featureName}
                </h3>

                <p style={{
                    fontSize: '14px',
                    color: '#d1d5db',
                    lineHeight: '1.5',
                    marginBottom: '24px'
                }}>
                    {description}
                </p>

                <button
                    onClick={() => navigate('/pro')}
                    style={{
                        background: 'white',
                        color: '#d97706',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 24px',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        width: '100%'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Unlock with Pro
                </button>
            </div>
        </div>
    );
};

export default FeatureLock;
