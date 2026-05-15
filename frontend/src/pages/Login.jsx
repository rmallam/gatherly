import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Scan, Fingerprint, Phone, Eye, EyeOff } from 'lucide-react';
import { BiometricService } from '../services/biometric';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithBiometric, enableBiometric, biometricAvailable, sendOTP, verifyOTP } = useAuth();
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [biometricLoading, setBiometricLoading] = useState(false);
    const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
    const [savedCredentials, setSavedCredentials] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Auto-trigger biometric authentication on mount if available
    useEffect(() => {
        const attemptBiometricLogin = async () => {
            if (biometricAvailable) {
                try {
                    const hasSavedCredentials = await BiometricService.hasCredentials('hosteze-app');

                    if (hasSavedCredentials) {
                        // Show loading state
                        setBiometricLoading(true);

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
                        setBiometricLoading(false);
                    }
                } catch (err) {
                    // Silent fail - user can still login with password
                    console.log('Auto biometric login failed:', err);
                    setBiometricLoading(false);
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
            if (loginMethod === 'phone') {
                const fullPhone = `${countryCode}${phone}`;

                if (showOtpInput) {
                    // Verify OTP
                    await verifyOTP(fullPhone, otp);
                    navigate('/'); // Login successful
                } else {
                    // Send OTP
                    await sendOTP(fullPhone);
                    setShowOtpInput(true);
                }
            } else {
                // Email + Password Login
                await login(email, password);

                // Check if biometric is already enabled before prompting
                if (biometricAvailable) {
                    const hasSavedCredentials = await BiometricService.hasCredentials('hosteze-app');

                    if (!hasSavedCredentials) {
                        setSavedCredentials({ email, password });
                        setShowBiometricPrompt(true);
                        return; // Wait for prompt interaction
                    }
                }
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

    // Reset OTP state when switching methods
    const handleMethodSwitch = (method) => {
        setLoginMethod(method);
        setShowOtpInput(false);
        setOtp('');
        setError('');
    };

    // Biometric enrollment prompt
    if (showBiometricPrompt) {
        return (
            <div className="auth-container">
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-main">
                    <div className="auth-card">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Fingerprint size={64} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
                            <h2 className="auth-title">
                                Enable Biometric Login?
                            </h2>
                            <p className="auth-subtitle">
                                Use your fingerprint or face to login faster next time
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={handleEnableBiometric}
                                className="btn btn-primary auth-submit-btn"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Fingerprint size={18} />
                                Enable Biometric
                            </button>
                            <button
                                onClick={handleSkipBiometric}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '12px',
                                    fontWeight: '600'
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
        <div className="auth-container">
            <div className="auth-orb auth-orb-1"></div>
            <div className="auth-orb auth-orb-2"></div>

            {/* Biometric Loading Overlay */}
            {biometricLoading && (
                <div className="biometric-overlay">
                    <div className="biometric-pulse">
                        <Fingerprint size={40} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>
                            Authenticating...
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            Please verify your identity
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="auth-header">
                <div className="container">
                    <h1>🎉 Host<i>Eze</i></h1>
                    <p>Event Management Made Easy</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="auth-main">
                <div className="auth-card">
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 className="auth-title">Welcome Back</h2>
                        <p className="auth-subtitle">
                            {loginMethod === 'email' ? 'Sign in to manage your events' : 'Sign in with one-time password'}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                            <span className="auth-error-text">{error}</span>
                        </div>
                    )}

                    {/* Email/Phone Toggle */}
                    <div className="auth-toggle-group">
                        <button
                            type="button"
                            onClick={() => handleMethodSwitch('email')}
                            className={`auth-toggle-btn ${loginMethod === 'email' ? 'active' : ''}`}
                        >
                            <Mail size={16} /> Email
                        </button>
                        <button
                            type="button"
                            onClick={() => handleMethodSwitch('phone')}
                            className={`auth-toggle-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                        >
                            <Phone size={16} /> Phone + OTP
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {loginMethod === 'email' ? (
                            <>
                                <div className="auth-form-group">
                                    <label className="auth-label">Email Address</label>
                                    <div className="auth-input-wrapper">
                                        <Mail size={18} className="auth-input-icon" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="auth-input"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="auth-form-group">
                                    <label className="auth-label">Password</label>
                                    <div className="auth-input-wrapper">
                                        <Lock size={18} className="auth-input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="auth-input"
                                            style={{ paddingRight: '2.75rem' }}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="auth-input-action"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <Link to="/forgot-password" className="auth-forgot-link">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="auth-form-group">
                                    <label className="auth-label">Phone Number</label>
                                    <div style={{ display: 'flex' }}>
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="auth-input country-select"
                                            disabled={showOtpInput}
                                        >
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+61">🇦🇺 +61</option>
                                            <option value="+971">🇦🇪 +971</option>
                                        </select>
                                        <div className="auth-input-wrapper phone-input">
                                            <Phone size={18} className="auth-input-icon" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                className="auth-input phone-input"
                                                placeholder="9876543210"
                                                maxLength={10}
                                                required
                                                disabled={showOtpInput}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {showOtpInput && (
                                    <div className="auth-form-group" style={{ animation: 'fadeScaleUp 0.3s ease-out' }}>
                                        <label className="auth-label">Enter Verification Code</label>
                                        <div className="auth-input-wrapper">
                                            <Lock size={18} className="auth-input-icon" />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="auth-input"
                                                style={{ letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 600 }}
                                                placeholder="123456"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                onClick={() => { setShowOtpInput(false); setOtp(''); }}
                                                className="auth-forgot-link"
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'inline-block' }}
                                            >
                                                Change Phone Number
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit-btn"
                            disabled={loading}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-border spinner-border-sm" role="status" style={{ width: '1rem', height: '1rem', border: '0.2em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }}></div>
                                    Processing...
                                </>
                            ) : (
                                loginMethod === 'email' ? 'Sign In' : (showOtpInput ? 'Verify & Login' : 'Send OTP')
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/signup">Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
