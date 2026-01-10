import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, FileText, Lock, Save, Eye, EyeOff, Moon, Sun, X, Check, LogOut, Shield, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Camera as CapCamera } from '@capacitor/camera';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

const Profile = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { refreshUser, logout, user } = useAuth();
    const { events } = useApp(); // Get events for stats

    // UI State
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security' | 'settings'

    // Initialize loading to false if we already have user data
    const [loading, setLoading] = useState(!user);
    const [saving, setSaving] = useState(false);

    // Stats Calculation
    const hostedCount = events.filter(e => e.role === 'host' || !e.role).length;
    const attendedCount = events.filter(e => e.role === 'guest').length;

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        profilePictureUrl: user?.profilePictureUrl || null
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
    const [showEnlargedImage, setShowEnlargedImage] = useState(false);

    // Initial phone parsing
    useEffect(() => {
        if (user?.phone) {
            if (user.phone.startsWith('+')) {
                const match = user.phone.match(/^(\+\d{1,3})(\d+)$/);
                if (match) {
                    setCountryCode(match[1]);
                    setPhoneDigits(match[2]);
                } else {
                    setPhoneDigits(user.phone.replace(/\D/g, '').slice(-10));
                }
            } else {
                setPhoneDigits(user.phone.replace(/\D/g, '').slice(-10));
            }
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // Only show loader if we don't have user data yet
            if (!user) setLoading(true);

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
                // Only show error if we don't have data
                if (!user) setError('Failed to load profile');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            if (!user) setError('Failed to load profile');
        } finally {
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
                refreshUser();
                setIsEditing(false); // Switch back to view mode
                setTimeout(() => setSuccess(''), 3000);
                // Refresh user data to update header avatar
                if (refreshUser) {
                    await refreshUser();
                }
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
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
        }}>
            {/* Top Navigation Bar */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: theme === 'dark' ? 'rgba(10, 10, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)', // Theme-aware glass effect
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                padding: 'max(env(safe-area-inset-top), 16px) 16px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ fontWeight: 600, fontSize: '17px', color: 'var(--text-primary)' }}>Profile</div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: isEditing ? '#6366f1' : 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            </div>

            {/* Success/Error Messages */}
            {(success || error) && (
                <div style={{
                    position: 'fixed',
                    top: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 200,
                    width: '90%',
                    maxWidth: '400px',
                    background: success ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    animation: 'slideDown 0.3s ease'
                }}>
                    {success ? <Check size={18} /> : <Shield size={18} />}
                    {success || error}
                </div>
            )}

            {/* Profile Header & Stats */}
            <div style={{ padding: '0 16px', marginBottom: '24px' }}>
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => profile.profilePictureUrl && setShowEnlargedImage(true)}
                            style={{
                                width: '100px',
                                height: '100px',
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
                                fontSize: '36px',
                                fontWeight: '700',
                                border: '4px solid var(--bg-primary)',
                                boxShadow: '0 8px 20px -6px rgba(0,0,0,0.15)',
                                cursor: profile.profilePictureUrl ? 'pointer' : 'default',
                            }}
                        >
                            {!profile.profilePictureUrl && (profile.name?.charAt(0).toUpperCase() || 'U')}
                        </div>
                        {isEditing && (
                            <button
                                onClick={pickImage}
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#6366f1',
                                    border: '2px solid var(--bg-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
                                }}
                            >
                                <Camera size={16} />
                            </button>
                        )}
                    </div>

                    {/* Name & Bio */}
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            margin: '0 0 4px 0'
                        }}>
                            {profile.name || 'User Name'}
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--text-tertiary)',
                            margin: 0,
                            maxWidth: '300px',
                            lineHeight: '1.4'
                        }}>
                            {profile.bio || 'No bio added yet'}
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        width: '100%',
                        maxWidth: '400px'
                    }}>
                        <div style={{
                            background: 'var(--bg-primary)',
                            padding: '16px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#6366f1',
                                marginBottom: '4px'
                            }}>
                                {hostedCount}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Events Hosted
                            </div>
                        </div>
                        <div style={{
                            background: 'var(--bg-primary)',
                            padding: '16px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#10b981',
                                marginBottom: '4px'
                            }}>
                                {attendedCount}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Events Attended
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs/Sections */}
            <div style={{ padding: '0 16px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Personal Info Card */}
                <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <User size={18} className="text-secondary" />
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Personal Info</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Name Field */}
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '6px', display: 'block' }}>FULL NAME</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="input"
                                    style={{ background: 'var(--bg-secondary)', border: 'none', padding: '12px', borderRadius: '12px' }}
                                />
                            ) : (
                                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{profile.name}</div>
                            )}
                        </div>

                        {/* Email Field - Always Read Only */}
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '6px', display: 'block' }}>EMAIL</label>
                            <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500, opacity: 0.8 }}>{profile.email}</div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '6px', display: 'block' }}>PHONE</label>
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="input"
                                        style={{ width: '80px', background: 'var(--bg-secondary)', border: 'none', borderRadius: '12px' }}
                                    >
                                        <option value="+91">+91</option>
                                        <option value="+1">+1</option>
                                        <option value="+44">+44</option>
                                        {/* Add more as needed */}
                                    </select>
                                    <input
                                        type="tel"
                                        value={phoneDigits}
                                        onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                                        className="input"
                                        style={{ flex: 1, background: 'var(--bg-secondary)', border: 'none', padding: '12px', borderRadius: '12px' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                    {profile.phone || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Bio Field */}
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '6px', display: 'block' }}>BIO</label>
                            {isEditing ? (
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="input"
                                    rows={3}
                                    style={{ width: '100%', background: 'var(--bg-secondary)', border: 'none', padding: '12px', borderRadius: '12px', resize: 'none' }}
                                />
                            ) : (
                                <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                    {profile.bio || 'No bio'}
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '14px',
                                    background: '#6366f1',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    marginTop: '8px',
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Info'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Theme Toggle Card */}
                <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme === 'dark' ? '#fbbf24' : '#f59e0b'
                        }}>
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dark Mode</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{theme === 'dark' ? 'On' : 'Off'}</div>
                        </div>
                    </div>
                    <label className="theme-toggle">
                        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                        <span className="slider"></span>
                    </label>
                </div>

                {/* Simple Actions List (Change Password, etc) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Collapsible Password Section could go here, for now just a button to expand */}
                    <button
                        onClick={() => setActiveTab(activeTab === 'security' ? 'details' : 'security')}
                        style={{
                            background: 'var(--bg-primary)',
                            padding: '20px',
                            borderRadius: '20px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'var(--text-primary)',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Lock size={20} className="text-secondary" />
                            Security & Password
                        </div>
                        <div style={{ transform: activeTab === 'security' ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>›</div>
                    </button>

                    {/* Change Password Form (Visible when toggled) */}
                    {activeTab === 'security' && (
                        <div style={{
                            background: 'var(--bg-primary)',
                            borderRadius: '20px',
                            padding: '20px',
                            marginTop: '-8px',
                            animation: 'slideDown 0.3s ease'
                        }}>
                            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block' }}>CURRENT PASSWORD</label>
                                    <input
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        className="input"
                                        style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '12px', padding: '12px', width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block' }}>NEW PASSWORD</label>
                                    <input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        className="input"
                                        style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '12px', padding: '12px', width: '100%' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: '#374151',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: 600,
                                        marginTop: '8px'
                                    }}
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to logout?')) {
                            logout();
                            navigate('/login');
                        }
                    }}
                    style={{
                        padding: '16px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '15px',
                        marginTop: '20px'
                    }}
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>

            {/* Crop Modal */}
            {showCropModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header with X and Checkmark */}
                    <div style={{
                        padding: '16px',
                        paddingTop: 'calc(16px + env(safe-area-inset-top))',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#000',
                        zIndex: 10
                    }}>
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
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={28} />
                        </button>

                        <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 600 }}>Crop Photo</h3>

                        <button
                            onClick={handleCropSave}
                            style={{
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            <Check size={28} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Cropper Area with Zoom Overlay */}
                    <div style={{
                        position: 'relative',
                        flex: 1,
                        backgroundColor: '#000'
                    }}>
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

                        {/* Zoom Control Overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 'calc(80px + env(safe-area-inset-bottom))',
                            left: '20px',
                            right: '20px',
                            padding: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <label style={{
                                color: 'white',
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block',
                                fontWeight: 500
                            }}>
                                Zoom: {zoom.toFixed(1)}x
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
                                    height: '6px',
                                    accentColor: '#10b981'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Enlarged Image Modal */}
            {showEnlargedImage && profile.profilePictureUrl && (
                <div
                    onClick={() => setShowEnlargedImage(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px',
                        cursor: 'zoom-out'
                    }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEnlargedImage(false);
                        }}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        <X size={24} color="white" />
                    </button>
                    <img
                        src={profile.profilePictureUrl}
                        alt="Profile"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            borderRadius: '12px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            cursor: 'default'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Profile;
