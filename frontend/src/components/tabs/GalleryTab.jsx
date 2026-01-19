import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Upload, ImageIcon, X } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

const GalleryTab = ({ event }) => {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const fileInputRef = useRef(null);
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);
    const minSwipeDistance = 50;

    const API_URL = window.location.origin.includes('localhost')
        ? (import.meta.env.VITE_API_URL || 'http://localhost:5001/api')
        : (import.meta.env.VITE_API_URL || 'https://gatherly-backend-3vmv.onrender.com/api');

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Fetch only photos
            const res = await fetch(`${API_URL}/wall/${event.id}/posts?type=photo&limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setPhotos(data.posts);
            }
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [event.id]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 10MB Limit Check
        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Please select an image under 10MB.');
            return;
        }

        try {
            setUploading(true); // Start loading state early
            // Compress Image
            const compressedBase64 = await compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.8
            });
            await handleUpload(compressedBase64);
        } catch (err) {
            console.error('Compression failed:', err);
            alert('Failed to process image.');
            setUploading(false);
        }
    };

    const handleUpload = async (base64Image) => {
        try {
            // setUploading(true) is already called in handleFileSelect
            const token = localStorage.getItem('token');

            // 1. Upload to Cloudinary via Backend
            const uploadRes = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64Image })
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url } = await uploadRes.json();

            // 2. Determine Participant ID (Try to find self in participants list)
            // We need a participant ID to post.
            // If the user isn't joined, this might fail unless we auto-join.
            // For now, let's assume they are the host or a guest who is joined.
            // We'll fetch the current user's participant profile first.
            let participantId = null;

            // Quick fetch to get my participant ID
            const partsRes = await fetch(`${API_URL}/wall/${event.id}/participants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (partsRes.ok) {
                const partsData = await partsRes.json();
                const myPart = partsData.participants.find(p => p.is_current_user);
                if (myPart) {
                    participantId = myPart.id;
                } else {
                    // Try to auto-join as "Host" or "Guest" if not found
                    // This is a simplified fallback
                    const joinRes = await fetch(`${API_URL}/wall/${event.id}/join`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            profilePhoto: user?.profile_picture_url,
                            bio: 'Event Gallery Uploader',
                            relationshipToHost: 'Host/Guest'
                        })
                    });
                    if (joinRes.ok) {
                        const joinData = await joinRes.json();
                        participantId = joinData.participant.id;
                    }
                }
            }

            if (!participantId) {
                alert('Could not identify you as an event participant. Please join the Event Wall first.');
                return;
            }

            // 3. Create Post
            const postRes = await fetch(`${API_URL}/wall/${event.id}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId,
                    type: 'photo',
                    content: '', // Empty content for gallery uploads
                    photoUrl: url
                })
            });

            if (postRes.ok) {
                await fetchPhotos(); // Refresh grid
            } else {
                alert('Failed to save to gallery');
            }

        } catch (error) {
            console.error('Upload flow failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleNext = (e) => {
        e.stopPropagation();
        if (!selectedPhoto) return;
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
        if (currentIndex < photos.length - 1) {
            setSelectedPhoto(photos[currentIndex + 1]);
        }
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (!selectedPhoto) return;
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
        if (currentIndex > 0) {
            setSelectedPhoto(photos[currentIndex - 1]);
        }
    };

    const onTouchStart = (e) => {
        touchEndRef.current = null;
        touchStartRef.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEndRef.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartRef.current || !touchEndRef.current) return;

        const distance = touchStartRef.current - touchEndRef.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Swiped Left -> Next Photo
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
            if (currentIndex < photos.length - 1) {
                setSelectedPhoto(photos[currentIndex + 1]);
            }
        }

        if (isRightSwipe) {
            // Swiped Right -> Prev Photo
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
            if (currentIndex > 0) {
                setSelectedPhoto(photos[currentIndex - 1]);
            }
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedPhoto) return;
            if (e.key === 'ArrowRight') handleNext(e);
            if (e.key === 'ArrowLeft') handlePrev(e);
            if (e.key === 'Escape') setSelectedPhoto(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPhoto, photos]);

    return (
        <div style={{ padding: '0 0 2rem 0' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Event Gallery
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Shared photos from guests and hosts.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
            ) : photos.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '16px',
                    border: '2px dashed var(--border)'
                }}>
                    <ImageIcon size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        No photos yet
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Be the first to share a memory from this event!
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary"
                    >
                        Upload Photos
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '0.5rem'
                }}>
                    {photos.map(photo => (
                        <div
                            key={photo.id}
                            onClick={() => setSelectedPhoto(photo)}
                            style={{
                                position: 'relative',
                                aspectRatio: '1',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: '#1f2937',
                            }}
                        >
                            <img
                                src={photo.photo_url || photo.photoUrl}
                                alt="Event moment"
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s'
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        background: 'rgba(0,0,0,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        touchAction: 'none'
                    }}
                    onClick={() => setSelectedPhoto(null)}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Close Button */}
                    <button
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2010
                        }}
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        disabled={photos.findIndex(p => p.id === selectedPhoto.id) === 0}
                        style={{
                            position: 'absolute',
                            left: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2010,
                            opacity: photos.findIndex(p => p.id === selectedPhoto.id) === 0 ? 0.3 : 1
                        }}
                    >
                        ◀
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={photos.findIndex(p => p.id === selectedPhoto.id) === photos.length - 1}
                        style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2010,
                            opacity: photos.findIndex(p => p.id === selectedPhoto.id) === photos.length - 1 ? 0.3 : 1
                        }}
                    >
                        ▶
                    </button>

                    <img
                        src={selectedPhoto.photo_url || selectedPhoto.photoUrl}
                        alt="Full size"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            borderRadius: '4px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            objectFit: 'contain'
                        }}
                        onClick={e => e.stopPropagation()}
                    />

                    {selectedPhoto.author_name && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: 'rgba(255,255,255,0.9)',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            backdropFilter: 'blur(4px)',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>
                            Shared by {selectedPhoto.author_name}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GalleryTab;
