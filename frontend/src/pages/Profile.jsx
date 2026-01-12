import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, Lock, Check, LogOut, Shield, Star, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Camera as CapCamera } from '@capacitor/camera';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import SubscriptionComparisonModal from '../components/SubscriptionComparisonModal';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { refreshUser, logout, user } = useAuth();
    const { events } = useApp();

    // UI State
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [showComparisonModal, setShowComparisonModal] = useState(false);

    // Initialize loading
    const [loading, setLoading] = useState(!user);
    const [saving, setSaving] = useState(false);

    // Stats
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
    }, [user?.phone]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            if (!user) setLoading(true);

            const token = localStorage.getItem('token');

            const res = await fetch(`${API_URL}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

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

            const base64Image = `data: image / ${image.format}; base64, ${image.base64String} `;
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
            const res = await fetch(`${API_URL} /users/profile`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token} `,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profile.name,
                    phone: phoneDigits ? `${countryCode}${phoneDigits} ` : '',
                    bio: profile.bio,
                    profilePictureUrl: profile.profilePictureUrl
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Profile updated!');
                refreshUser();
                setIsEditing(false); // Switch back to view mode
                setTimeout(() => setSuccess(''), 3000);
                // Refresh user data to update header avatar
                if (refreshUser) {
                    await refreshUser();
                }
            } else {
                setError(data.error || 'Failed to update');
            }
        } catch (error) {
            console.error('Error saving:', error);
            setError('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const token = localStorage.getItem('token');

            const res = await fetch(`${API_URL} /users/change - password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token} `,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            const data = await res.json();

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
            <div className="profile-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Navbar */}
            <div className="profile-navbar">
                <button onClick={() => navigate(-1)} className="nav-btn">
                    <ArrowLeft size={24} />
                </button>
                <div style={{ fontWeight: 600, fontSize: '17px' }}>Profile</div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="nav-btn"
                    style={{ color: isEditing ? 'var(--accent-color)' : 'var(--text-primary)', fontSize: '15px', fontWeight: 600, width: 'auto' }}
                >
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            </div>

            {/* Success/Error Messages */}
            {(success || error) && (
                <div className={`message - container ${success ? 'message-success' : 'message-error'} `}>
                    {success ? <Check size={18} /> : <Shield size={18} />}
                    {success || error}
                </div>
            )}

            {/* Content Wrapper */}
            <div className="profile-content-wrapper">

                {/* Header Section */}
                <div className="profile-header">
                    <div className="avatar-container">
                        <div
                            className="avatar"
                            onClick={() => profile.profilePictureUrl && setShowEnlargedImage(true)}
                            style={{
                                backgroundImage: profile.profilePictureUrl ? `url(${profile.profilePictureUrl})` : 'none',
                                background: !profile.profilePictureUrl ? 'linear-gradient(135deg, #6366f1, #a855f7)' : undefined
                            }}
                        >
                            {!profile.profilePictureUrl && (profile.name?.charAt(0).toUpperCase() || 'U')}
                        </div>
                        {isEditing && (
                            <button onClick={pickImage} className="edit-avatar-btn">
                                <Camera size={16} />
                            </button>
                        )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 className="user-name">{profile.name || 'User'}</h2>
                        <p className="user-bio">{profile.bio || 'Add a bio to tell people about yourself.'}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#6366f1' }}>{hostedCount}</div>
                        <div className="stat-label">Events Hosted</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#10b981' }}>{attendedCount}</div>
                        <div className="stat-label">Attended</div>
                    </div>
                </div>

                {/* Subscription Card - Premium Look */}
                <div className="sub-card">
                    <div className="pro-badge-glow" />
                    <div className="sub-header">
                        <div>
                            <div className="current-plan-label">CURRENT MEMBERSHIP</div>
                            <div className="plan-name">
                                {user?.subscription_tier === 'pro' ? 'Pro Access' : 'Free Account'}
                                {user?.subscription_tier === 'pro' && <Star size={20} fill="#f59e0b" stroke="#f59e0b" />}
                            </div>
                        </div>
                    </div>

                    <div className="credits-row">
                        <span className="credits-label">SMS Credits Balance</span>
                        <span className="credits-value">{user?.sms_credits || 0}</span>
                    </div>

                    {user?.subscription_tier === 'pro' ? (
                        <button
                            className="action-btn btn-glass"
                            onClick={() => navigate('/pro')}
                        >
                            Manage Subscription / Buy Credits
                        </button>
                    ) : (
                        <button
                            className="action-btn btn-primary-gradient"
                            onClick={() => navigate('/pro')}
                        >
                            Upgrade to Pro
                        </button>
                    )}

                    {(!user?.subscription_tier || user?.subscription_tier === 'free') && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                                <span>Free Events Used</span>
                                <span>{hostedCount} / 3</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.min((hostedCount / 3) * 100, 100)}% `,
                                    height: '100%',
                                    background: hostedCount >= 3 ? '#ef4444' : '#6366f1'
                                }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Compare Plans Link */}
                <div className="compare-plans-link-container">
                    <button
                        onClick={() => setShowComparisonModal(true)}
                        className="compare-plans-link"
                    >
                        <Star size={16} /> Compare plan benefits
                    </button>
                </div>

                <SubscriptionComparisonModal
                    isOpen={showComparisonModal}
                    onClose={() => setShowComparisonModal(false)}
                />

                {/* Info Card */}
                <div className="info-card">
                    <div className="card-title">
                        <User size={20} style={{ color: '#6366f1' }} />
                        Personal Information
                    </div>

                    <div className="fields-grid">
                        <div className="field-group">
                            <label className="field-label">Full Name</label>
                            {isEditing ? (
                                <input
                                    className="modern-input"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    placeholder="Your Name"
                                />
                            ) : (
                                <div className="field-value">{profile.name}</div>
                            )}
                        </div>

                        <div className="field-group">
                            <label className="field-label">Email Address</label>
                            <div className="field-value" style={{ opacity: 0.7 }}>{profile.email}</div>
                        </div>

                        <div className="field-group">
                            <label className="field-label">Phone Number</label>
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        className="modern-input"
                                        style={{ width: '60px' }}
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                    >
                                        <option value="+91">+91</option>
                                        <option value="+1">+1</option>
                                        <option value="+44">+44</option>
                                    </select>
                                    <input
                                        className="modern-input"
                                        type="tel"
                                        value={phoneDigits}
                                        onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Mobile Number"
                                    />
                                </div>
                            ) : (
                                <div className="field-value">{profile.phone || 'Not set'}</div>
                            )}
                        </div>

                        <div className="field-group">
                            <label className="field-label">Bio</label>
                            {isEditing ? (
                                <textarea
                                    className="modern-input"
                                    rows={2}
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    style={{ resize: 'none', lineHeight: '1.4' }}
                                />
                            ) : (
                                <div className="field-value" style={{ lineHeight: '1.5', fontSize: '15px' }}>{profile.bio || 'No bio'}</div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="save-info-btn"
                        >
                            {saving ? 'Saving...' : 'Save Info'}
                        </button>
                    )}
                </div>

                {/* Security Section (Collapsible) */}
                {/* Security Section (Collapsible) */}
                <div className="expandable-card">
                    <button
                        className="card-header-btn"
                        onClick={() => setActiveTab(activeTab === 'security' ? 'details' : 'security')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Lock size={20} style={{ color: '#6366f1' }} />
                            Security & Password
                        </div>
                        <ChevronRight size={20} style={{ transform: activeTab === 'security' ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                    </button>

                    {activeTab === 'security' && (
                        <div className="card-content">
                            <form onSubmit={handleChangePassword}>
                                <div className="fields-grid">
                                    <div className="field-group">
                                        <label className="field-label">CURRENT PASSWORD</label>
                                        <input
                                            type="password"
                                            value={passwords.currentPassword}
                                            onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                            className="modern-input"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">NEW PASSWORD</label>
                                        <input
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="modern-input"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">CONFIRM PASSWORD</label>
                                        <input
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className="modern-input"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="save-info-btn"
                                    style={{ background: '#374151', marginTop: '20px' }}
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    className="logout-btn"
                    onClick={() => {
                        if (confirm('Are you sure you want to logout?')) {
                            logout();
                            navigate('/login');
                        }
                    }}
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>

            {/* Crop Modal */}
            {
                showCropModal && (
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
                )
            }

            {/* Enlarged Image Modal */}
            {
                showEnlargedImage && profile.profilePictureUrl && (
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
                )
            }
        </div >
    );
};

export default Profile;
