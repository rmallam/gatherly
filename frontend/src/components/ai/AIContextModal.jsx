import React, { useState } from 'react';
import { X, Sparkles, MapPin, Tag } from 'lucide-react';
import '../../pages/EventTabs.css'; // Inheriting modern tab styles

const AIContextModal = ({ event, actionType, isOpen, onClose, onConfirm, generating }) => {
    const [extraInstructions, setExtraInstructions] = useState('');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={!generating ? onClose : undefined} style={{ zIndex: 9999 }}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', padding: '0' }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    background: 'var(--bg-secondary)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px'
                }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Sparkles size={20} color="var(--primary)" />
                            Review AI Context
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            To get the best {actionType.toLowerCase()}, the AI will look at your event details. Is there anything else you want to prioritize?
                        </p>
                    </div>
                    {!generating && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Read-Only Context Preview */}
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                            {event.title}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem' }}>
                                <Tag size={16} color="var(--text-tertiary)" style={{ marginTop: '2px' }} />
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500, marginRight: '4px' }}>Theme:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{event.description || 'Not specified'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                <MapPin size={16} color="var(--text-tertiary)" />
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500, marginRight: '4px' }}>Location:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{event.location || event.country || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extra Instructions Input */}
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            Extra Instructions (Optional)
                        </label>
                        <textarea
                            className="modern-input"
                            placeholder={"e.g., 'Make sure the tasks are mostly DIY' or 'Include vegan appetizers'"}
                            value={extraInstructions}
                            onChange={(e) => setExtraInstructions(e.target.value)}
                            style={{
                                minHeight: '80px',
                                resize: 'vertical',
                                width: '100%'
                            }}
                            disabled={generating}
                        />
                    </div>
                </div>

                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={generating}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => onConfirm(extraInstructions)}
                        disabled={generating}
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            border: 'none',
                        }}
                    >
                        {generating ? 'Generating...' : `Generate ${actionType}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIContextModal;
