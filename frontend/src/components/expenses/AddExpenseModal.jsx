import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../../config/api';
import { ArrowLeft, Check, Camera, Image as ImageIcon, Users, FileText, Loader, Lock, Receipt, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBackButton } from '../../hooks/useBackButton';
import './Expenses.css';

const AddExpenseModal = ({ eventId, event, onClose, onExpenseAdded, initialData }) => {
    useBackButton(onClose, true);
    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        amount: initialData?.amount || '',
        currency: initialData?.currency || 'USD',
        description: initialData?.merchant || initialData?.description || '',
        category: initialData?.category || 'food',
        paidBy: '',
        expenseDate: initialData?.date || initialData?.expense_date || new Date().toISOString().split('T')[0],
        splitType: initialData?.splitType || 'equal',
        receiptUrl: initialData?.receipt_url || ''
    });
    const [customSplits, setCustomSplits] = useState({});
    const [lineItems, setLineItems] = useState(initialData?.lineItems || []);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [scanState, setScanState] = useState('');
    const [showSplitDetails, setShowSplitDetails] = useState(false);

    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Pre-calculate customSplits if lineItems exist
    useEffect(() => {
        if (lineItems.length > 0 && formData.splitType === 'itemized') {
            const newSplits = {};
            lineItems.forEach(item => {
                if (item.assignedTo) {
                    newSplits[item.assignedTo] = (newSplits[item.assignedTo] || 0) + parseFloat(item.price || 0);
                }
            });

            const tax = parseFloat(initialData?.tax || 0);
            const tip = parseFloat(initialData?.tip || 0);
            const totalAssigned = Object.values(newSplits).reduce((sum, val) => sum + val, 0);

            if (totalAssigned > 0 && (tax > 0 || tip > 0)) {
                Object.keys(newSplits).forEach(userId => {
                    const share = newSplits[userId] / totalAssigned;
                    newSplits[userId] += (tax * share) + (tip * share);
                });
            }

            setCustomSplits(newSplits);
        }
    }, [lineItems, formData.splitType, initialData]);

    const handleAssignLineItem = (index, userId) => {
        setFormData(prev => ({ ...prev, splitType: 'itemized' }));
        setLineItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], assignedTo: userId };
            return newItems;
        });

        if (userId && !selectedParticipants.includes(userId)) {
            setSelectedParticipants(prev => [...prev, userId]);
        }
    };

    const handleScanClick = (inputType) => {
        const isPro = user?.subscription_tier === 'pro' || user?.subscription_tier === 'business';
        if (!isPro) {
            if (confirm('Receipt Scanning is a Pro feature. Upgrade to unlock?')) {
                navigate('/pro');
            }
            return;
        }

        if (inputType === 'camera') {
            cameraInputRef.current?.click();
        } else {
            galleryInputRef.current?.click();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanState('uploading');
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64Image = reader.result.split(',')[1];
                    const mimeType = file.type;
                    const token = localStorage.getItem('token');
                    
                    try {
                        const uploadResponse = await fetch(`${API_URL}/upload/image`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ image: `data:${mimeType};base64,${base64Image}` })
                        });
                        if (uploadResponse.ok) {
                            const uploadData = await uploadResponse.json();
                            setFormData(prev => ({ ...prev, receiptUrl: uploadData.url }));
                        }
                    } catch (uploadErr) {
                        console.error('Failed to upload receipt image:', uploadErr);
                    }

                    setScanState('analyzing');
                    const response = await fetch(`${API_URL}/gemini/analyze-receipt`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ image: base64Image, mimeType })
                    });

                    if (!response.ok) throw new Error('Failed to analyze receipt');

                    const data = await response.json();

                    if (data.isReceipt) {
                        setFormData(prev => ({
                            ...prev,
                            amount: data.amount ? data.amount.toString() : prev.amount,
                            currency: data.currency || prev.currency,
                            description: data.merchant || data.description || prev.description,
                            category: data.category || prev.category,
                            expenseDate: data.date || prev.expenseDate,
                            splitType: (data.lineItems && data.lineItems.length > 0) ? 'itemized' : 'equal'
                        }));
                        if (data.lineItems && data.lineItems.length > 0) {
                            setLineItems(data.lineItems);
                            setShowSplitDetails(true); // Automatically show split details on successful scan
                        }
                    } else {
                        alert('Could not detect a valid receipt in this image.');
                    }
                } catch (error) {
                    console.error('Scan error:', error);
                    alert('Failed to analyze receipt. Please try again.');
                } finally {
                    setScanState('');
                    if (cameraInputRef.current) cameraInputRef.current.value = '';
                    if (galleryInputRef.current) galleryInputRef.current.value = '';
                }
            };
            reader.onerror = () => {
                console.error('File reading error');
                alert('Failed to read file.');
                setScanState('');
            };
        } catch (error) {
            console.error('File selection error:', error);
            setScanState('');
        }
    };

    const participants = React.useMemo(() => {
        if (event.event_type === 'shared') {
            const eventOwner = {
                id: event.user_id,
                name: event.user_name || 'Event Owner',
                email: null,
                phone: null,
                isRegistered: true,
                isOwner: true
            };

            const guestParticipants = (event.guests || []).map(g => ({
                id: g.user_id || g.id,
                name: g.name,
                email: g.email,
                phone: g.phone,
                isRegistered: !!g.user_id,
                isOwner: false
            }));

            const allParticipants = [eventOwner, ...guestParticipants];

            return allParticipants.filter((p, index, self) => {
                return index === self.findIndex(t => t.id === p.id);
            });
        } else {
            const eventOwner = {
                id: event.user_id,
                name: event.user_name || 'Event Owner',
                email: null,
                phone: null,
                isRegistered: true,
                isOwner: true
            };

            const guestParticipants = (event.guests || []).map(g => ({
                id: g.user_id || g.id,
                name: g.name,
                email: g.email,
                phone: g.phone,
                isRegistered: !!g.user_id,
                isOwner: false
            }));

            const allParticipants = [eventOwner, ...guestParticipants];

            return allParticipants.filter((p, index, self) => {
                return index === self.findIndex(t => t.id === p.id);
            });
        }
    }, [event]);

    React.useEffect(() => {
        if (selectedParticipants.length === 0 && participants.length > 0) {
            setSelectedParticipants(participants.map(p => p.id));
            const userId = localStorage.getItem('userId');
            const defaultPayer = participants.find(p => p.id === userId) ? userId : participants[0]?.id;
            if (defaultPayer && !formData.paidBy) {
                setFormData(prev => ({ ...prev, paidBy: defaultPayer }));
            }
        }
    }, [participants.length]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount');
                setLoading(false);
                return;
            }

            if (selectedParticipants.length === 0) {
                setError('Please select at least one participant');
                setLoading(false);
                return;
            }

            let splits = [];
            if (formData.splitType === 'equal') {
                const splitAmount = amount / selectedParticipants.length;
                splits = selectedParticipants.map(participantId => {
                    const participant = participants.find(p => p.id === participantId);
                    if (!participant) return null;
                    return participant.isRegistered
                        ? { userId: participant.id, amount: splitAmount }
                        : { name: participant.name, email: participant.email, phone: participant.phone, amount: splitAmount };
                }).filter(Boolean);
            } else {
                splits = selectedParticipants.map(participantId => {
                    const participant = participants.find(p => p.id === participantId);
                    if (!participant) return null;
                    const splitAmount = parseFloat(customSplits[participantId] || 0);
                    return participant.isRegistered
                        ? { userId: participant.id, amount: splitAmount }
                        : { name: participant.name, email: participant.email, phone: participant.phone, amount: splitAmount };
                }).filter(Boolean);

                const total = splits.reduce((sum, s) => sum + s.amount, 0);
                if (Math.abs(total - amount) > 0.01) {
                    setError(`Split amounts ($${total.toFixed(2)}) must equal total amount ($${amount.toFixed(2)})`);
                    setLoading(false);
                    return;
                }
            }

            const isEditing = !!formData.id;
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                amount,
                splits,
                lineItems: formData.splitType === 'itemized' ? lineItems : null
            };

            const url = isEditing 
                ? `${API_URL}/events/${eventId}/expenses/${formData.id}`
                : `${API_URL}/events/${eventId}/expenses`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();

            if (response.ok) {
                onExpenseAdded();
                onClose();
            } else {
                const data = responseText ? JSON.parse(responseText) : {};
                const errorMsg = data.error || data.message || 'Failed to create expense';
                const details = data.missingFields ? ` (Missing: ${data.missingFields.join(', ')})` : '';
                setError(errorMsg + details);
            }
        } catch (error) {
            console.error('Error creating expense:', error);
            setError('Failed to create expense');
        } finally {
            setLoading(false);
        }
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCustomSplitChange = (userId, value) => {
        setCustomSplits(prev => ({
            ...prev,
            [userId]: value
        }));
    };

    // Helper formatting
    const payerName = participants.find(p => p.id === formData.paidBy)?.name || 'you';

    return (
        <div className="expenses-fullscreen-modal">
            {/* Header */}
            <div className="expenses-header">
                <button onClick={onClose}><ArrowLeft size={24} /></button>
                <h3>{formData.id ? 'Edit expense' : 'Add expense'}</h3>
                <button onClick={handleSubmit} disabled={loading} style={{ color: '#10b981' }}>
                    {loading ? <Loader size={20} className="spin" /> : 'Save'}
                </button>
            </div>

            <div className="expenses-content" style={{ alignItems: 'center' }}>
                {error && (
                    <div style={{ background: '#ef444420', color: '#fca5a5', padding: '12px', borderRadius: '8px', width: '100%', maxWidth: '320px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <div className="with-badge-container">
                    With you and: 
                    <div className="with-badge" onClick={() => setShowSplitDetails(!showSplitDetails)}>
                        <Users size={16} /> All of {event.event_name || 'Event'}
                    </div>
                </div>

                <div style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Description Input */}
                    <div className="minimal-input-row">
                        <div className="minimal-input-icon">
                            <FileText size={20} color="#ffffff" />
                        </div>
                        <input
                            type="text"
                            className="minimal-input"
                            placeholder="Enter a description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Amount Input */}
                    <div className="minimal-input-row" style={{ borderBottomColor: '#10b981' }}>
                        <div className="minimal-input-icon" style={{ background: 'transparent', border: 'none' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            className="minimal-input amount"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                </div>

                <div className="split-controls">
                    Paid by <button className="split-btn" onClick={() => setShowSplitDetails(!showSplitDetails)}>{payerName}</button> and split <button className="split-btn" onClick={() => setShowSplitDetails(!showSplitDetails)}>{formData.splitType}</button>
                </div>

                {/* Big Save Button */}
                <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    style={{ 
                        marginTop: '24px', 
                        width: '100%', 
                        maxWidth: '320px', 
                        background: '#10b981', 
                        color: 'white', 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {loading ? <Loader size={20} className="spin" /> : 'Save Expense'}
                </button>

                {/* Sub-panel for advanced splits (shown conditionally to keep UI minimal) */}
                {showSplitDetails && (
                    <div style={{ width: '100%', maxWidth: '320px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', marginTop: '20px', fontSize: '0.9rem' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', color: '#8e8e93', marginBottom: '8px' }}>Who Paid?</label>
                            <select 
                                value={formData.paidBy} 
                                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                                style={{ width: '100%', background: '#1c1c1e', color: 'white', padding: '8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
                            >
                                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', color: '#8e8e93', marginBottom: '8px' }}>Split Options</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['equal', 'custom', ...(lineItems.length > 0 ? ['itemized'] : [])].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, splitType: type })}
                                        style={{
                                            flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                                            background: formData.splitType === type ? '#10b981' : '#1c1c1e',
                                            color: 'white', textTransform: 'capitalize', cursor: 'pointer'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Splits */}
                        {formData.splitType !== 'equal' && formData.splitType !== 'itemized' && (
                            <div style={{ marginTop: '16px' }}>
                                {participants.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span>{p.name}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={customSplits[p.id] || ''}
                                            onChange={(e) => handleCustomSplitChange(p.id, e.target.value)}
                                            style={{ width: '80px', background: '#1c1c1e', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Itemized AI Splits */}
                        {formData.splitType === 'itemized' && lineItems.length > 0 && (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {lineItems.map((item, idx) => (
                                    <div key={idx} style={{ background: '#1c1c1e', padding: '8px', borderRadius: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', flex: 1 }}>{item.name}</span>
                                            <span style={{ fontWeight: 'bold' }}>${parseFloat(item.price || 0).toFixed(2)}</span>
                                        </div>
                                        <select
                                            value={item.assignedTo || ''}
                                            onChange={(e) => handleAssignLineItem(idx, e.target.value)}
                                            style={{ width: '100%', background: 'transparent', color: '#5ac8fa', border: '1px solid rgba(255,255,255,0.1)', padding: '4px', borderRadius: '4px', fontSize: '0.8rem' }}
                                        >
                                            <option value="" style={{color: 'black'}}>Assign to...</option>
                                            {participants.map(p => <option key={p.id} value={p.id} style={{color: 'black'}}>{p.name}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden file inputs */}
            <input type="file" ref={cameraInputRef} style={{ display: 'none' }} accept="image/*" capture="environment" onChange={handleFileSelect} />
            <input type="file" ref={galleryInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />

            {/* AI Scan Overlay */}
            {scanState && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(26,26,28,0.9)', zIndex: 10000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                    <Loader size={48} className="spin" color="#10b981" />
                    <h3 style={{ marginTop: '16px' }}>{scanState === 'uploading' ? 'Uploading...' : 'Analyzing Receipt...'}</h3>
                    <p style={{ color: '#8e8e93' }}>Our AI is doing the math for you.</p>
                </div>
            )}

            {/* Bottom Toolbar */}
            <div className="expenses-toolbar">
                <button type="button" className="toolbar-btn" onClick={() => handleScanClick('camera')} title="Scan Receipt">
                    <Camera size={24} />
                </button>
                <button type="button" className="toolbar-btn" onClick={() => handleScanClick('gallery')} title="Upload Receipt Image">
                    <ImageIcon size={24} />
                </button>
                <div style={{ position: 'relative' }}>
                    <button type="button" className="toolbar-btn" title="Set Date">
                        <Calendar size={24} />
                    </button>
                    {/* Native date picker hidden but clickable over the icon */}
                    <input 
                        type="date" 
                        value={formData.expenseDate} 
                        onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;
