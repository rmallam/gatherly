import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import API_URL from '../config/api';

const ForgotPassword = () => {
    const [method, setMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const isPhone = method === 'phone';
            const identifier = isPhone ? `${countryCode}${phone}` : email;

            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    isPhone ? { phone: identifier } : { email: identifier }
                ),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset link');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
                {/* Header */}
                <div style={{ padding: '3rem 0 2rem', borderBottom: '1px solid var(--border)' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            🎉 Host<i>Eze</i>
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Event Management Made Easy
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                    <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                Check Your Email
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                                If an account exists with the provided information, we've sent you a password reset link.
                                Please check your email and follow the instructions.
                            </p>
                        </div>

                        <Link
                            to="/login"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <ArrowLeft size={18} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <div style={{ padding: '3rem 0 2rem', borderBottom: '1px solid var(--border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        🎉 Host<i>Eze</i>
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Event Management Made Easy
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Forgot Password?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            No worries! Enter your email or phone number and we'll send you reset instructions.
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.875rem',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem'
                        }}>
                            <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '0.125rem' }} />
                            <span style={{ color: '#991b1b', fontSize: '0.875rem', lineHeight: '1.5' }}>{error}</span>
                        </div>
                    )}

                    {/* Email/Phone Toggle */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        background: 'var(--bg-secondary)',
                        padding: '4px',
                        borderRadius: '10px'
                    }}>
                        <button
                            type="button"
                            onClick={() => setMethod('email')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: method === 'email' ? 'white' : 'transparent',
                                color: method === 'email' ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxShadow: method === 'email' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setMethod('phone')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: method === 'phone' ? 'white' : 'transparent',
                                color: method === 'phone' ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxShadow: method === 'phone' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Phone size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            Phone
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        {method === 'email' ? (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input"
                                        style={{ paddingLeft: '2.75rem' }}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    Phone Number
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative', width: '120px' }}>
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="form-input"
                                            style={{ paddingLeft: '1rem', paddingRight: '0.5rem' }}
                                        >
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+61">🇦🇺 +61</option>
                                            <option value="+971">🇦🇪 +971</option>
                                        </select>
                                    </div>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="form-input"
                                            style={{ paddingLeft: '2.75rem' }}
                                            placeholder="9876543210"
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600 }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                        Remember your password?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
