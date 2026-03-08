import React, { useState } from 'react';
import { X, Sparkles, Wand2, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GenerateInviteModal = ({ isOpen, onClose, event, onInviteGenerated }) => {
    const { token } = useAuth();
    const [tone, setTone] = useState('Casual');
    const [theme, setTheme] = useState('');
    const [format, setFormat] = useState('text');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedInvite, setGeneratedInvite] = useState('');
    const [copied, setCopied] = useState(false);

    if (!isOpen || !event) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const endpoint = format === 'image'
                ? `${baseUrl}/events/${event.id}/ai-invite-image`
                : `${baseUrl}/events/${event.id}/ai-invite`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tone, theme })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate invitation');
            }

            const data = await res.json();
            setGeneratedInvite(format === 'image' ? data.image : data.invitation);
        } catch (error) {
            console.error('Error generating invite:', error);
            alert(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!generatedInvite) return;

        try {
            await navigator.clipboard.writeText(generatedInvite);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy. Please try selecting the text manually.');
        }
    };

    const handleUseInvite = () => {
        if (onInviteGenerated) {
            onInviteGenerated(generatedInvite);
        }
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div style={{ maxWidth: '500px', width: '100%', padding: '2rem', background: '#1f2937', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={20} color="#a855f7" /> AI Magic Invite
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>Select Tone</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: '#374151', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                        >
                            <option value="Casual">Casual & Friendly</option>
                            <option value="Formal">Formal & Elegant</option>
                            <option value="Fun">Fun & Energetic</option>
                            <option value="Humorous">Humorous</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>Event Theme (Optional)</label>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g. 80s Retro, Beach Party, Black Tie"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: '#374151', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e5e7eb', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="inviteFormat"
                                value="text"
                                checked={format === 'text'}
                                onChange={() => setFormat('text')}
                            />
                            Text Message
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e5e7eb', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="inviteFormat"
                                value="image"
                                checked={format === 'image'}
                                onChange={() => setFormat('image')}
                            />
                            Visual Image Card
                        </label>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: 'white',
                            fontWeight: 600,
                            border: 'none',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: isGenerating ? 0.7 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <Wand2 size={18} /> {isGenerating ? 'Drafting Magic...' : 'Generate Invite'}
                    </button>
                </div>

                {/* Generated Result Container */}
                {generatedInvite && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
                        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', background: '#111827', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            {generatedInvite.startsWith('data:image') ? (
                                <img
                                    src={generatedInvite}
                                    alt="Generated Invite Card"
                                    style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                                />
                            ) : (
                                <textarea
                                    value={generatedInvite}
                                    onChange={(e) => setGeneratedInvite(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        padding: '1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#e5e7eb',
                                        resize: 'none',
                                        outline: 'none',
                                        lineHeight: '1.5',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            )}

                            {!generatedInvite.startsWith('data:image') && (
                                <button
                                    onClick={handleCopy}
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: copied ? '#10b981' : '#9ca3af',
                                        padding: '0.5rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                    title="Copy to clipboard"
                                >
                                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button
                                onClick={onClose}
                                style={{ padding: '0.75rem', background: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUseInvite}
                                style={{ padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Use This {generatedInvite.startsWith('data:image') ? 'Image' : 'Message'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateInviteModal;
