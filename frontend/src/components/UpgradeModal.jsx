import React from 'react';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UpgradeModal.css';

const UpgradeModal = ({ isOpen, onClose, triggerReason }) => {
    if (!isOpen) return null;

    const benefits = [
        "Unlimited Events (Free limit: 3)",
        "Unlimited Guests (Free limit: 50)",
        "Advanced Budget Tracking",
        "Ad-free Experience"
    ];

    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose();
        navigate('/pro');
    };

    return (
        <div className="upgrade-modal-overlay" onClick={onClose}>
            <div className="upgrade-modal-content" onClick={e => e.stopPropagation()}>
                <button className="upgrade-modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="upgrade-modal-header">
                    <div className="upgrade-badge">PRO</div>
                    <h2>Unlock Full Potential</h2>
                    {triggerReason && (
                        <p className="upgrade-trigger-msg">{triggerReason}</p>
                    )}
                </div>

                <div className="upgrade-benefits">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-item">
                            <div className="benefit-icon">
                                <Check size={16} color="white" />
                            </div>
                            <span>{benefit}</span>
                        </div>
                    ))}
                </div>

                <div className="upgrade-pricing">
                    <div className="price-tag">
                        <span className="currency">$</span>
                        <span className="amount">4.99</span>
                        <span className="period">/month</span>
                    </div>
                    <p className="cancel-anytime">Cancel anytime. No commitment.</p>
                </div>

                <button className="upgrade-cta-btn" onClick={handleUpgrade}>
                    Get Pro Access
                </button>
            </div>
        </div>
    );
};

export default UpgradeModal;
