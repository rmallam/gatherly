import React, { useState } from 'react';
import { Search, Loader, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import API_URL from '../../config/api';
import { formatCurrency } from '../../utils/currencyUtils';
import UpgradeModal from '../UpgradeModal';

const AIVendorQuoteAnalyzer = ({ event, onQuoteAnalyzed }) => {
    const [quoteText, setQuoteText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState(null);

    const handleAnalyze = async () => {
        if (!quoteText.trim()) {
            setError('Please paste the vendor quote or contract text to analyze.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setAnalysisResult(null);

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/${event.id}/vendors/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quoteText })
            });

            if (!res.ok) {
                const errorData = await res.json();

                if (res.status === 403 && errorData.error?.includes('Pro subscription required')) {
                    setUpgradeReason(errorData.message || 'Upgrade to Pro to analyze vendor quotes');
                    setShowUpgradeModal(true);
                    return;
                }

                throw new Error(errorData.error || 'Failed to analyze quote');
            }

            const data = await res.json();
            setAnalysisResult(data);
            setIsExpanded(true);

        } catch (err) {
            console.error('AI Quote Analysis Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVendor = () => {
        if (!analysisResult) return;

        // Pass the extracted data back to the parent to auto-fill the add vendor form
        onQuoteAnalyzed({
            name: analysisResult.vendor_name !== 'Unknown' ? analysisResult.vendor_name : '',
            category: ['photography', 'catering', 'entertainment', 'decoration', 'venue', 'transport', 'other'].includes(analysisResult.category?.toLowerCase()) ? analysisResult.category.toLowerCase() : 'other',
            cost: analysisResult.total_cost || '',
            notes: `Included:\n- ${analysisResult.included_items?.join('\n- ')}\n\nHidden Fees to Watch:\n- ${analysisResult.hidden_fees?.join('\n- ')}\n\nNegotiation:\n- ${analysisResult.negotiation_tactics?.join('\n- ')}`
        });

        // Reset the analyzer
        setQuoteText('');
        setAnalysisResult(null);
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
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '10px' }}>
                        <Search size={22} color="#f43f5e" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        AI Quote Analyzer
                    </h3>
                </div>
                {isExpanded ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
            </div>

            {isExpanded && (
                <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                        Paste any vendor proposal or contract text. AI will spot hidden fees, verify what's included, and suggest negotiation tactics.
                    </p>

                    {!analysisResult ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <textarea
                                value={quoteText}
                                onChange={(e) => setQuoteText(e.target.value)}
                                placeholder="Paste vendor quote or contract text here..."
                                className="modern-input"
                                style={{
                                    minHeight: '120px',
                                    resize: 'vertical',
                                }}
                                disabled={loading}
                            />

                            {error && (
                                <div style={{ color: '#ef4444', fontSize: '12px' }}>{error}</div>
                            )}

                            <button
                                onClick={handleAnalyze}
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
                                    <><Loader size={18} className="animate-spin" /> Analyzing Quote...</>
                                ) : (
                                    <><Search size={18} /> Analyze Quote</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            background: 'var(--bg-primary)',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {analysisResult.vendor_name}
                                    </h4>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                        {analysisResult.category}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Est. Total</div>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
                                        {formatCurrency(analysisResult.total_cost, event.country)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                {/* Included Items */}
                                {analysisResult.included_items?.length > 0 && (
                                    <div>
                                        <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <CheckCircle2 size={16} color="#10b981" /> Included
                                        </h5>
                                        <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                            {analysisResult.included_items.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Hidden Fees / Gotchas */}
                                {analysisResult.hidden_fees?.length > 0 && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                        <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <AlertTriangle size={16} /> Hidden Fees / Gotchas
                                        </h5>
                                        <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '13px', color: '#b91c1c', lineHeight: '1.5' }}>
                                            {analysisResult.hidden_fees.map((fee, i) => <li key={i}>{fee}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Negotiation Tactics */}
                                {analysisResult.negotiation_tactics?.length > 0 && (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                        <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#059669', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            💡 Negotiation Tactics
                                        </h5>
                                        <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '13px', color: '#047857', lineHeight: '1.5' }}>
                                            {analysisResult.negotiation_tactics.map((tactic, i) => <li key={i}>{tactic}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button
                                    onClick={handleAddVendor}
                                    style={{
                                        flex: 1,
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Pre-fill Vendor Details
                                </button>
                                <button
                                    onClick={() => setAnalysisResult(null)}
                                    style={{
                                        flex: 1,
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear & Analyze Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                triggerReason={upgradeReason}
            />
        </div>
    );
};

export default AIVendorQuoteAnalyzer;
