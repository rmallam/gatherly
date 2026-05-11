import React from 'react';
import { X, Check, X as XIcon, Minus } from 'lucide-react';
import './SubscriptionComparisonModal.css';

const SubscriptionComparisonModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const features = [
        { name: 'Created Events', free: '3 Max', pro: 'Unlimited' },
        { name: 'Guests per Event', free: '50 Max', pro: 'Unlimited' },
        { name: 'Bulk Guest Import', free: 'Limited (50)', pro: 'Unlimited' },
        { name: 'Ad-Free Experience', free: false, pro: true },
        { name: 'Budget Tracker', free: false, pro: true },
        { name: 'Priority Support', free: false, pro: true },
    ];

    return (
        <div className="comparison-modal-overlay" onClick={onClose}>
            <div className="comparison-modal-content" onClick={e => e.stopPropagation()}>
                <button className="comparison-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="comparison-header">
                    <h2>Plan Comparison</h2>
                    <p>Choose the plan that fits your needs</p>
                </div>

                <div className="comparison-table-container">
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th className="feature-col">Feature</th>
                                <th className="free-col">Free</th>
                                <th className="pro-col">
                                    <span className="pro-header">PRO</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, index) => (
                                <tr key={index}>
                                    <td className="feature-name">{feature.name}</td>
                                    <td className="free-cell">
                                        {renderValue(feature.free)}
                                    </td>
                                    <td className="pro-cell">
                                        {renderValue(feature.pro)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="comparison-footer">
                    <button className="close-action-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper to render check/x or text
const renderValue = (value) => {
    if (value === true) return <div className="icon-box check"><Check size={18} /></div>;
    if (value === false) return <div className="icon-box x"><Minus size={18} /></div>; // Using Minus for "Not included" looks cleaner than X sometimes, or standard gray X
    return <span className="text-value">{value}</span>;
};

export default SubscriptionComparisonModal;
