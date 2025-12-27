import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, FileText, Lock, Save, Eye, EyeOff, Moon, Sun, X } from 'lucide-react';
import { Camera as CapCamera } from '@capacitor/camera';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Profile = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        profilePictureUrl: null
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneDigits, setPhoneDigits] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Crop states
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Loading profile with token:', token ? 'present' : 'missing');

            const res = await fetch(`${API_URL}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Profile response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('Profile data received:', data);

                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    bio: data.bio || '',
                    profilePictureUrl: data.profilePictureUrl || null
                });

                // Parse phone number into country code and digits
                if (data.phone) {
                    // Check if phone starts with +
                    if (data.phone.startsWith('+')) {
                        // Extract country code (e.g., +91, +1, +44)
                        const match = data.phone.match(/^(\+\d{1,3})(\d+)$/);
                        if (match) {
                            setCountryCode(match[1]);
                            setPhoneDigits(match[2]);
                        } else {
                            setPhoneDigits(data.phone.replace(/\D/g, '').slice(-10));
                        }
                    } else {
                        // No country code, just digits
                        setPhoneDigits(data.phone.replace(/\D/g, '').slice(-10));
                    }
                }
            } else {
                const errorText = await res.text();
                console.error('Profile load failed:', res.status, errorText);
                setError('Failed to load profile');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading profile:', error);
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const image = await CapCamera.getPhoto({
                quality: 90,
                resultType: 'base64',
                source: 'photos',
                saveToGallery: false
            });

            const base64Image = `data:image/${image.format};base64,${image.base64String}`;
            setImageSrc(base64Image);
            setShowCropModal(true);
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            setProfile({ ...profile, profilePictureUrl: croppedImage });
            setShowCropModal(false);
            setImageSrc(null);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profile.name,
                    phone: phoneDigits ? `${countryCode}${phoneDigits}` : '',
                    bio: profile.bio,
                    profilePictureUrl: profile.profilePictureUrl
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Profile updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        console.log('=== Change Password Attempt ===');
        console.log('Passwords match:', passwords.newPassword === passwords.confirmPassword);

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const token = localStorage.getItem('token');
            console.log('Token present:', token ? 'yes' : 'no');
            console.log('Calling API:', `${API_URL}/users/change-password`);

            const res = await fetch(`${API_URL}/users/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);

            if (res.ok) {
                setSuccess('Password changed successfully!');
                setPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => setSuccess(''), 5000); // Show for 5 seconds
            } else {
                const errorMsg = data.error || 'Failed to change password';
                console.error('Password change failed:', errorMsg);
                setError(errorMsg);
                // Keep error message visible longer
                setTimeout(() => setError(''), 5000);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setError('Network error: Failed to change password');
            setTimeout(() => setError(''), 5000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: '#6366f1', fontSize: '18px', fontWeight: 600 }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-secondary)',
            paddingTop: 'max(20px, env(safe-area-inset-top))',
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
        }}>
            {/* Header */}
            <div style={{
                background: 'var(--bg-primary)',
                padding: '16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#6b7280'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                }}>
                    My Profile
                </h1>
            </div>

            <div style={{ padding: '0 16px', maxWidth: '600px', margin: '0 auto' }}>
                {/* Success/Error Messages - Fixed at top */}
                {success && (
                    <div style={{
                        position: 'fixed',
                        top: 'max(70px, calc(env(safe-area-inset-top) + 70px))',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'calc(100% - 32px)',
                        maxWidth: '568px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: '2px solid #047857',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: '600',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        animation: 'slideDown 0.3s ease'
                    }}>
                        ✓ {success}
                    </div>
                )}

                {error && (
                    <div style={{
                        position: 'fixed',
                        top: 'max(70px, calc(env(safe-area-inset-top) + 70px))',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'calc(100% - 32px)',
                        maxWidth: '568px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: '2px solid #b91c1c',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: '600',
                        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        animation: 'slideDown 0.3s ease'
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Profile Picture */}
                <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '20px',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: profile.profilePictureUrl
                                ? `url(${profile.profilePictureUrl})`
                                : 'linear-gradient(135deg, #6366f1, #a855f7)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '48px',
                            fontWeight: '900',
                            border: '4px solid #f3f4f6'
                        }}>
                            {!profile.profilePictureUrl && (profile.name?.charAt(0).toUpperCase() || 'U')}
                        </div>

                        <button
                            onClick={pickImage}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                background: '#6366f1',
                                border: 'none',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Camera size={18} />
                            Change Photo
                        </button>
                    </div>
                </div>

                {/* Profile Information */}
                <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '20px',
                    border: '1px solid var(--border)'
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginTop: 0,
                        marginBottom: '20px'
                    }}>
                        Personal Information
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Name */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px'
                            }}>
                                <User size={16} />
                                Name
                            </label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="input"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px'
                            }}>
                                <Mail size={16} />
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="input"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px'
                            }}>
                                <Phone size={16} />
                                Phone
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="input"
                                    style={{ width: '120px' }}
                                >
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+61">🇦🇺 +61</option>
                                    <option value="+971">🇦🇪 +971</option>
                                </select>
                                <input
                                    type="tel"
                                    value={phoneDigits}
                                    onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                                    placeholder="9876543210"
                                    maxLength={10}
                                    className="input"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px'
                            }}>
                                <FileText size={16} />
                                Bio
                            </label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                maxLength={500}
                                className="input"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                            />
                            <div style={{
                                textAlign: 'right',
                                fontSize: '12px',
                                color: '#9ca3af',
                                marginTop: '4px'
                            }}>
                                {profile.bio?.length || 0}/500
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        style={{
                            width: '100%',
                            marginTop: '20px',
                            padding: '12px',
                            borderRadius: '8px',
                            background: saving ? '#9ca3af' : '#6366f1',
                            border: 'none',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '15px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Change Password */}
                <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '20px',
                    border: '1px solid var(--border)'
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginTop: 0,
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Lock size={20} />
                        Change Password
                    </h2>

                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Current Password */}
                        <div>
                            <label style={{
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px',
                                display: 'block'
                            }}>
                                Current Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.current ? 'text' : 'password'}
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="input"
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: 0
                                    }}
                                >
                                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label style={{
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px',
                                display: 'block'
                            }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.new ? 'text' : 'password'}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="input"
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: 0
                                    }}
                                >
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={{
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px',
                                display: 'block'
                            }}>
                                Confirm New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="input"
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: 0
                                    }}
                                >
                                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                            style={{
                                width: '100%',
                                marginTop: '4px',
                                padding: '12px',
                                borderRadius: '8px',
                                background: (saving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) ? '#9ca3af' : '#6366f1',
                                border: 'none',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '15px',
                                cursor: (saving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {saving ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Theme Settings */}
                <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '80px',
                    border: '1px solid var(--border)'
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginTop: 0,
                        marginBottom: '20px'
                    }}>
                        Appearance
                    </h2>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                    Dark Theme
                                </h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                                    {theme === 'dark' ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                        </div>

                        <label className="theme-toggle">
                            <input
                                type="checkbox"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 600 }}>Crop Photo</h3>
                        <button
                            onClick={() => {
                                setShowCropModal(false);
                                setImageSrc(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Cropper */}
                    <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    {/* Controls */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Zoom Slider */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: 'white', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                                Zoom
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    accentColor: '#6366f1'
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setShowCropModal(false);
                                    setImageSrc(null);
                                }}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'transparent',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCropSave}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
