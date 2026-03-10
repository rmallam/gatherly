import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Wand2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UpgradeModal from './UpgradeModal';

const AIAssistantWidget = () => {
    const { token } = useAuth();
    const { id } = useParams(); // active eventId context, if any
    const { fetchEvents, events } = useApp(); // Access all events to give AI context

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am your HostEze AI Assistant. I can help you add guests, track expenses, answer questions, or create events instantly! What would you like to do?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Only run if we have a token and events, and we haven't already replaced the initial message
        if (token && events && events.length > 0 && messages.length === 1 && messages[0].text.includes('Hi! I am your HostEze AI Assistant')) {
            const fetchProactiveGreeting = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                    const res = await fetch(`${baseUrl}/ai/proactive-greeting`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.greeting) {
                            setMessages([{ role: 'ai', text: data.greeting }]);
                            // Auto-open chatbot to show proactive alert
                            setIsOpen(true);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch proactive greeting:', error);
                }
            };
            fetchProactiveGreeting();
        }
    }, [token, events.length]); // depend on events.length so it triggers after fetchEvents completes

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText.trim();
        setInputText('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Create a lightweight summary of events for the AI
            const userEventsData = events.map(e => ({ id: e.id, title: e.title, date: e.date, type: e.eventType }));

            // Find active event summary
            const activeEvent = id ? events.find(e => e.id === id) : null;
            let activeEventSummary = null;
            if (activeEvent) {
                activeEventSummary = {
                    id: activeEvent.id,
                    title: activeEvent.title,
                    guestCount: activeEvent.guests?.length || 0,
                    guestsAttended: activeEvent.guests?.filter(g => g.attended)?.length || 0,
                    budget: activeEvent.budget || 0
                };
            }

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${baseUrl}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    context: {
                        eventId: id, // Explicit active context
                        activeEventStats: activeEventSummary,
                        userEvents: userEventsData, // All events the user owns
                        history: messages.map(m => ({ role: m.role, text: m.text })).slice(-6) // Send up to last 6 messages for context
                    }
                })
            });

            if (!res.ok) {
                const errorData = await res.json();

                // Catch Pro Tier restriction
                if (res.status === 403 && errorData.error?.includes('Pro subscription required')) {
                    setUpgradeReason(errorData.message || 'Upgrade to Pro to use the AI Assistant');
                    setShowUpgradeModal(true);

                    // Remove the user's message from the array so they can try again later
                    setMessages(prev => prev.slice(0, -1));
                    return;
                }

                throw new Error(errorData.error || 'Failed to connect to AI');
            }

            const data = await res.json();

            // Add AI reply to chat
            setMessages(prev => [...prev, {
                role: 'ai',
                text: data.reply || "I've processed your request!",
                action: data.action
            }]);

            // Refresh global state if we mutated data
            if (data.action !== 'GENERAL_CHAT') {
                await fetchEvents();
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: `Sorry, I ran into an error: ${error.message}`, error: true }]);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            {/* The Magic FAB */}
            <div style={{ position: 'fixed', bottom: '170px', right: '24px', zIndex: 9000 }}>
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="ai-fab-btn"
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '30px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4), 0 0 0 4px rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            animation: 'aiPulse 3s infinite'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Sparkles size={28} />
                    </button>
                )}
            </div>

            {/* Bottom Sheet Modal overlay */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'flex-end',
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setIsOpen(false)}>

                    {/* The actual sliding sheet */}
                    <div
                        style={{
                            width: '100%',
                            height: '85vh',
                            maxHeight: '85vh',
                            background: '#1f2937', // Dark theme matching current app
                            borderTopLeftRadius: '24px',
                            borderTopRightRadius: '24px',
                            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when tapping inside the sheet
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Wand2 size={20} color="#a855f7" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>HostEze AI</h3>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Your smart event concierge</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.6)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '18px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area - Fill remaining space */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            background: '#111827'
                        }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    padding: '14px 18px',
                                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    background: msg.role === 'user' ? 'var(--primary)' : msg.error ? '#ef4444' : '#374151',
                                    color: 'white',
                                    fontSize: '15px',
                                    lineHeight: '1.5',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                }}>
                                    {msg.role === 'ai' && !msg.error && (
                                        <Sparkles size={16} style={{ color: '#a855f7', float: 'left', marginTop: '3px', marginRight: '8px' }} />
                                    )}
                                    {msg.text}
                                </div>
                            ))}
                            {isLoading && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '14px 18px',
                                    borderRadius: '20px 20px 20px 4px',
                                    background: '#374151',
                                    color: '#9ca3af',
                                    fontSize: '15px'
                                }}>
                                    Thinking<span style={{ animation: 'aiPulse 1.5s infinite' }}>...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} style={{ height: '8px' }} />
                        </div>

                        {/* Input Area - Sticks to the bottom of the sheet */}
                        <div style={{
                            padding: 'padding: 16px 20px max(16px, env(safe-area-inset-bottom)) 20px', // Handles iOS home indicator
                            background: '#1f2937',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me to add an expense, draft a schedule..."
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: '#374151',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '15px',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !inputText.trim()}
                                style={{
                                    background: inputText.trim() && !isLoading ? 'linear-gradient(135deg, var(--primary), #8b5cf6)' : '#4b5563',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '48px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    boxShadow: inputText.trim() && !isLoading ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
                                }}
                            >
                                <Send size={20} style={{ marginLeft: '2px' }} /> {/* Shifted slightly right for optical balance */}
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
        </>
    );
};

export default AIAssistantWidget;
