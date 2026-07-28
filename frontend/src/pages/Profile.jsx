import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Scan, Gem, Mail, Bell, Lock, User, Star, HelpCircle, LogOut, ArrowLeft, Camera, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Camera as CapCamera } from '@capacitor/camera';
import API_URL from '../config/api';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { logout, user, refreshUser } = useAuth();

    // Views: 'menu' | 'edit_profile' | 'security'
    const [currentView, setCurrentView] = useState('menu');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Profile State
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        profilePictureUrl: user?.profilePictureUrl || null
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
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            const token = localStorage.getItem('token');
            let finalProfilePictureUrl = profile.profilePictureUrl;

            if (profile.profilePictureUrl && profile.profilePictureUrl.startsWith('data:image')) {
                const uploadRes = await fetch(`${API_URL}/upload/image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: profile.profilePictureUrl })
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image');
                }
                const uploadData = await uploadRes.json();
                finalProfilePictureUrl = uploadData.url;
            }

            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profile.name,
                    phone: phoneDigits ? `${countryCode}${phoneDigits}` : null,
                    bio: profile.bio,
                    profilePictureUrl: finalProfilePictureUrl
                })
            });

            if (res.ok) {
                setSuccess('Profile updated!');
                refreshUser();
                setCurrentView('menu');
                setProfile(prev => ({ ...prev, profilePictureUrl: finalProfilePictureUrl }));
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update');
            }
        } catch (error) {
            setError('Failed to save: ' + error.message);
        } finally {
            setSaving(false);
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

    const renderCropModal = () => (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.95)', display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ padding: '16px', paddingTop: 'calc(16px + env(safe-area-inset-top))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000', zIndex: 10 }}>
                <button onClick={() => { setShowCropModal(false); setImageSrc(null); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}>
                    <X size={28} />
                </button>
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 600 }}>Crop Photo</h3>
                <button onClick={handleCropSave} style={{ background: '#10b981', border: 'none', borderRadius: '50%', width: '44px', height: '44px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={28} strokeWidth={3} />
                </button>
            </div>
            <div style={{ position: 'relative', flex: 1, backgroundColor: '#000' }}>
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
        </div>
    );

    const renderMessages = () => (
        (success || error) && (
            <div className={`message-container ${success ? 'message-success' : 'message-error'}`}>
                {success || error}
            </div>
        )
    );

    if (currentView === 'edit_profile') {
        return (
            <div className="profile-container">
                <div className="profile-navbar">
                    <button onClick={() => setCurrentView('menu')} className="nav-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ fontWeight: 600, fontSize: '17px' }}>Edit Profile</div>
                    <div style={{width: 40}}></div>
                </div>
                {renderMessages()}
                <div className="edit-profile-section">
                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: 32, marginTop: 16}}>
                        <div className="avatar-simple" onClick={pickImage} style={{width: 80, height: 80, cursor: 'pointer', position: 'relative'}}>
                            {profile.profilePictureUrl ? (
                                <img src={profile.profilePictureUrl} alt="Profile" />
                            ) : (
                                profile.name?.charAt(0).toUpperCase() || 'U'
                            )}
                            <div style={{position: 'absolute', bottom: 0, right: 0, background: '#6366f1', borderRadius: '50%', padding: 4}}>
                                <Camera size={14} color="white" />
                            </div>
                        </div>
                    </div>

                    <div className="edit-input-group">
                        <label>Full Name</label>
                        <input className="edit-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div className="edit-input-group">
                        <label>Phone Number</label>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <input className="edit-input" style={{width: '60px'}} value={countryCode} onChange={e => setCountryCode(e.target.value)} />
                            <input className="edit-input" type="tel" value={phoneDigits} onChange={e => setPhoneDigits(e.target.value.replace(/\D/g, ''))} />
                        </div>
                    </div>
                    <div className="edit-input-group">
                        <label>Bio</label>
                        <input className="edit-input" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
                    </div>

                    <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                {showCropModal && renderCropModal()}
            </div>
        );
    }

    if (currentView === 'security') {
        return (
            <div className="profile-container">
                <div className="profile-navbar">
                    <button onClick={() => setCurrentView('menu')} className="nav-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ fontWeight: 600, fontSize: '17px' }}>Security</div>
                    <div style={{width: 40}}></div>
                </div>
                {renderMessages()}
                <div className="edit-profile-section" style={{ marginTop: 16 }}>
                    <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px' }}>🔐 Passwordless login</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                            Your account has no password to remember or leak. Each time you log in,
                            we send a one-time code to your email or phone. If you ever lose access,
                            just request a fresh code — there's nothing to reset.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Default 'menu' view
    return (
        <div className="profile-container">
            <div className="profile-navbar" style={{ justifyContent: 'flex-end' }}>
                <button className="nav-btn">
                    <Search size={22} />
                </button>
            </div>

            {renderMessages()}

            <div className="settings-group" style={{marginTop: '16px'}}>
                <button className="settings-list-item" onClick={() => navigate('/scanner')}>
                    <div className="settings-icon-wrapper"><Scan size={22} /></div>
                    <span>Scan code</span>
                </button>
                <button className="settings-list-item" onClick={() => navigate('/pro')}>
                    <div className="settings-icon-wrapper pro-icon"><Gem size={22} /></div>
                    <span>HostEze Pro</span>
                </button>
            </div>

            <div className="settings-group">
                <div className="settings-group-title">Preferences</div>
                <button className="settings-list-item" onClick={() => setCurrentView('edit_profile')}>
                    <div className="settings-icon-wrapper"><User size={22} /></div>
                    <span>Edit Profile</span>
                </button>
                <button className="settings-list-item" onClick={() => alert('Email settings coming soon!')}>
                    <div className="settings-icon-wrapper"><Mail size={22} /></div>
                    <span>Email settings</span>
                </button>
                <button className="settings-list-item" onClick={() => alert('Device settings coming soon!')}>
                    <div className="settings-icon-wrapper"><Bell size={22} /></div>
                    <span>Device and push notification settings</span>
                </button>
                <button className="settings-list-item" onClick={() => setCurrentView('security')}>
                    <div className="settings-icon-wrapper"><Lock size={22} /></div>
                    <span>Security</span>
                </button>
            </div>

            <div className="settings-group">
                <div className="settings-group-title">Feedback</div>
                <button className="settings-list-item" onClick={() => window.open('https://play.google.com/store/apps/details?id=com.vyogo.hosteze', '_blank')}>
                    <div className="settings-icon-wrapper"><Star size={22} /></div>
                    <span>Rate HostEze</span>
                </button>
                <button className="settings-list-item" onClick={() => window.location.href = 'mailto:support@vyogo.tech'}>
                    <div className="settings-icon-wrapper"><HelpCircle size={22} /></div>
                    <span>Contact HostEze support</span>
                </button>
            </div>

            <div className="settings-group" style={{borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16}}>
                <button 
                    className="settings-list-item" 
                    onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                            logout();
                            navigate('/login');
                        }
                    }}
                >
                    <div className="settings-icon-wrapper" style={{color: '#10b981'}}><LogOut size={22} /></div>
                    <span style={{color: '#10b981'}}>Log out</span>
                </button>
            </div>

            <div className="profile-footer">
                <div className="footer-text">
                    Crafted with care by the Vyogo Team<br/>
                    Copyright © 2026 Vyogo Tech<br/>
                    <br/>
                    <a href="https://vyogo.tech/privacy" target="_blank" className="footer-links">Privacy Policy</a><br/>
                    v1.0.0
                </div>
            </div>
            
            <div className="footer-graphic"></div>
        </div>
    );
};

export default Profile;
