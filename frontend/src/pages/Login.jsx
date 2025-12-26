import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Scan, Fingerprint, Phone } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithBiometric, enableBiometric, continueAsGuest, biometricAvailable } = useAuth();
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
    const [savedCredentials, setSavedCredentials] = useState(null);

    // Auto-trigger biometric authentication on mount if available
    useEffect(() => {
        const attemptBiometricLogin = async () => {
            if (biometricAvailable) {
                try {
                    const { BiometricService } = await import('../services/biometric');
                    const hasSavedCredentials = await BiometricService.hasCredentials('hosteze-app');

                    if (hasSavedCredentials) {
                        // Automatically trigger biometric auth
                        const authenticated = await BiometricService.authenticate();

                        if (authenticated) {
                            // Retrieve and login with saved credentials
                            const credentials = await BiometricService.getCredentials('hosteze-app');
                            if (credentials && credentials.username && credentials.password) {
                                await login(credentials.username, credentials.password);
                                navigate('/');
                            }
                        }
                        // If authentication fails or is cancelled, just show the login form
                    }
                } catch (err) {
                    // Silent fail - user can still login with password
                    console.log('Auto biometric login failed:', err);
                }
            }
        };

        attemptBiometricLogin();
    }, [biometricAvailable]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const isPhone = loginMethod === 'phone';
            const identifier = isPhone ? `${countryCode}${phone}` : email;
            await login(identifier, password, isPhone);

            // Check if biometric is already enabled before prompting
            if (biometricAvailable) {
                // Check if credentials are already saved
                const { BiometricService } = await import('../services/biometric');
                const hasSavedCredentials = await BiometricService.hasCredentials('hosteze-app');

                if (!hasSavedCredentials) {
                    // Only show prompt if not already set up
                    setSavedCredentials({ email: identifier, password });
                    setShowBiometricPrompt(true);
                } else {
                    // Already set up, just navigate
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEnableBiometric = async () => {
        try {
            await enableBiometric(savedCredentials.email, savedCredentials.password);
            navigate('/');
        } catch (err) {
            console.error('Failed to save biometric:', err);
            navigate('/');
        }
    };

    const handleSkipBiometric = () => {
        navigate('/');
    };

    // Biometric enrollment prompt
    if (showBiometricPrompt) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                    <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Fingerprint size={64} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                Enable Biometric Login?
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                                Use your fingerprint or face to login faster next time
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={handleEnableBiometric}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.875rem' }}
                            >
                                <Fingerprint size={18} />
                                Enable Biometric
                            </button>
                            <button
                                onClick={handleSkipBiometric}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                Skip for Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        🎉 HostEze
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
                            Welcome Back
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            Sign in to manage your events
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
                            onClick={() => setLoginMethod('email')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: loginMethod === 'email' ? 'white' : 'transparent',
                                color: loginMethod === 'email' ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxShadow: loginMethod === 'email' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMethod('phone')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: loginMethod === 'phone' ? 'white' : 'transparent',
                                color: loginMethod === 'phone' ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxShadow: loginMethod === 'phone' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Phone size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            Phone
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        {loginMethod === 'email' ? (
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>

                    <button
                        onClick={() => {
                            continueAsGuest();
                            navigate('/');
                        }}
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        Continue as Guest
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
