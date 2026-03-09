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
        <div style={{ position: 'fixed', bottom: '170px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '500px',
                    maxHeight: '80vh',
                    marginBottom: '16px',
                    background: '#1f2937',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                            <Wand2 size={20} />
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#111827' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                padding: '12px 16px',
                                borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                background: msg.role === 'user' ? '#6366f1' : msg.error ? '#ef4444' : '#374151',
                                color: 'white',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {msg.role === 'ai' && !msg.error && (
                                    <Sparkles size={14} style={{ color: '#a855f7', float: 'left', marginTop: '3px', marginRight: '6px' }} />
                                )}
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '16px 16px 16px 0', background: '#374151', color: '#9ca3af', fontSize: '14px' }}>
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '16px', background: '#1f2937', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Type a command..."
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: '#374151',
                                color: 'white',
                                outline: 'none',
                                fontSize: '14px'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !inputText.trim()}
                            style={{
                                background: inputText.trim() && !isLoading ? '#6366f1' : '#4b5563',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
                                transition: 'background 0.2s'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.2s, background 0.2s',
                    transform: isOpen ? 'scale(0.9)' : 'scale(1)'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>

            {/* Pro Paywall Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                triggerReason={upgradeReason}
            />

        </div>
    );
};

export default AIAssistantWidget;
