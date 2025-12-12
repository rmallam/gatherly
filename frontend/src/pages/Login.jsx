import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Scan, Fingerprint } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithBiometric, enableBiometric, continueAsGuest, biometricAvailable } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
    const [savedCredentials, setSavedCredentials] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);

            // Check if biometric is already enabled before prompting
            if (biometricAvailable) {
                // Check if credentials are already saved
                const { BiometricService } = await import('../services/biometric');
                const hasSavedCredentials = await BiometricService.hasCredentials('gatherly');

                if (!hasSavedCredentials) {
                    // Only show prompt if not already set up
                    setSavedCredentials({ email, password });
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

    const handleBiometricLogin = async () => {
        setError('');
        setLoading(true);

        try {
            await loginWithBiometric();
            navigate('/');
        } catch (err) {
            setError(err.message || 'Biometric authentication failed');
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
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <Scan size={32} style={{ color: 'var(--primary)' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Gatherly</h1>
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

                    {/* Biometric Login Button */}
                    {biometricAvailable && (
                        <>
                            <button
                                onClick={handleBiometricLogin}
                                className="btn"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    marginBottom: '1.5rem'
                                }}
                            >
                                <Fingerprint size={20} />
                                Login with Fingerprint/Face
                            </button>

                            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>OR USE PASSWORD</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                            </div>
                        </>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
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
