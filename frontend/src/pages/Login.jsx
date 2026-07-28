import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, KeyRound, ArrowRight, User } from 'lucide-react';
import './Login.css';

// Passwordless auth: enter an email or phone, receive a one-time code, verify.
// A new identifier auto-creates an account — so this single screen is both
// "log in" and "sign up".
const Login = () => {
    const navigate = useNavigate();
    const { sendOTP, verifyOTP } = useAuth();

    const [step, setStep] = useState('identifier'); // 'identifier' | 'code'
    const [identifier, setIdentifier] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [channel, setChannel] = useState('email');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const looksLikeEmail = identifier.includes('@');

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setLoading(true);
        try {
            const res = await sendOTP(identifier.trim());
            setChannel(res.channel || (looksLikeEmail ? 'email' : 'sms'));
            setInfo(res.message || 'Code sent. Check your inbox.');
            setStep('code');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyOTP(identifier.trim(), code, name.trim() || undefined);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setInfo('');
        setLoading(true);
        try {
            const res = await sendOTP(identifier.trim());
            setInfo(res.message || 'A new code is on its way.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <div className="container">
                    <h1>🎉 Host<i>Eze</i></h1>
                    <p>Event Management Made Easy</p>
                </div>
            </div>

            <div className="auth-main">
                <div className="auth-card">
                    {step === 'identifier' ? (
                        <>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 className="auth-title">Log in or sign up</h2>
                                <p className="auth-subtitle">
                                    Enter your email or phone and we'll send you a one-time code. No password needed.
                                </p>
                            </div>

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                    <span className="auth-error-text">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSendCode}>
                                <div className="auth-form-group">
                                    <label className="auth-label">Email or phone number</label>
                                    <div className="auth-input-wrapper">
                                        <Mail size={18} className="auth-input-icon" />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="auth-input"
                                            placeholder="you@email.com or +91 9876543210"
                                            autoComplete="username"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                                        Tip: use email — it's instant and free.
                                    </p>
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label">Your name <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(new here? optional)</span></label>
                                    <div className="auth-input-wrapper">
                                        <User size={18} className="auth-input-icon" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="auth-input"
                                            placeholder="Your name"
                                            autoComplete="name"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary auth-submit-btn"
                                    disabled={loading}
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                >
                                    {loading ? 'Sending…' : <>Send code <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 className="auth-title">Enter your code</h2>
                                <p className="auth-subtitle">
                                    We sent a 6-digit code to <strong>{identifier}</strong> via {channel === 'email' ? 'email' : 'SMS'}.
                                </p>
                            </div>

                            {info && !error && (
                                <div className="auth-error" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }}>
                                    <KeyRound size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                                    <span className="auth-error-text" style={{ color: 'var(--text-primary)' }}>{info}</span>
                                </div>
                            )}

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                    <span className="auth-error-text">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerify}>
                                <div className="auth-form-group">
                                    <label className="auth-label">Verification code</label>
                                    <div className="auth-input-wrapper">
                                        <KeyRound size={18} className="auth-input-icon" />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="auth-input"
                                            style={{ letterSpacing: '6px', fontSize: '1.4rem', fontWeight: 700 }}
                                            placeholder="123456"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary auth-submit-btn"
                                    disabled={loading || code.length < 6}
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                >
                                    {loading ? 'Verifying…' : 'Verify & continue'}
                                </button>
                            </form>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => { setStep('identifier'); setCode(''); setError(''); setInfo(''); }}
                                    className="auth-forgot-link"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                >
                                    ← Change email/phone
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="auth-forgot-link"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                >
                                    Resend code
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
