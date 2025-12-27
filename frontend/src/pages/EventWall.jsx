import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Send, ArrowLeft, Plus, Users, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { Camera } from '@capacitor/camera';
import Header from '../components/Header';
import confetti from 'canvas-confetti';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const EventWall = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [currentParticipantId, setCurrentParticipantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [event, setEvent] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadEventWall();
    }, [eventId]);

    const loadEventWall = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch event details
            const eventRes = await fetch(`${API_URL}/wall/${eventId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (eventRes.ok) {
                const eventData = await eventRes.json();
                setEvent(eventData);
            }

            // Auto-join event wall first
            const joinRes = await fetch(`${API_URL}/wall/${eventId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!joinRes.ok) {
                const errorText = await joinRes.text();
                console.error('Join failed:', joinRes.status, errorText.substring(0, 200));
                throw new Error(`Failed to join event wall: ${joinRes.status}`);
            }

            // Load posts
            const postsRes = await fetch(`${API_URL}/wall/${eventId}/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!postsRes.ok) {
                const errorText = await postsRes.text();
                console.error('Posts fetch failed:', postsRes.status, errorText.substring(0, 200));
                throw new Error(`Failed to load posts: ${postsRes.status}`);
            }

            const postsData = await postsRes.json();
            setPosts(postsData.posts || []);

            // Load participants
            const participantsRes = await fetch(`${API_URL}/wall/${eventId}/participants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!participantsRes.ok) {
                const errorText = await participantsRes.text();
                console.error('Participants fetch failed:', participantsRes.status, errorText.substring(0, 200));
                throw new Error(`Failed to load participants: ${participantsRes.status}`);
            }

            const participantsData = await participantsRes.json();
            const participantsList = participantsData.participants || [];
            setParticipants(participantsList);

            // Find and store current user's participant ID
            const currentParticipant = participantsList.find(p => p.is_current_user);
            if (currentParticipant) {
                setCurrentParticipantId(currentParticipant.id);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading event wall:', error);
            setLoading(false);
        }
    };

    // Get current user ID from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id);
            } catch (e) {
                console.error('Error parsing token:', e);
            }
        }
    }, []);

    const pickImage = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 70,
                resultType: 'base64',
                source: 'photos',
                saveToGallery: false
            });

            const base64Image = `data:image/${image.format};base64,${image.base64String}`;
            setSelectedImage(base64Image);
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedImage) return;
        if (isSubmitting) return; // Prevent multiple submissions

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');

            if (!currentParticipantId) {
                alert('Unable to post - no participant found. Please refresh the page.');
                console.error('No current participant ID found');
                return;
            }

            const res = await fetch(`${API_URL}/wall/${eventId}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: currentParticipantId,
                    type: selectedImage ? 'photo' : 'message',
                    content: newPostContent || '',
                    photoUrl: selectedImage || null
                })
            });

            console.log('Post creation response status:', res.status);
            const responseData = await res.json();
            console.log('Post creation response data:', responseData);

            if (res.ok) {
                // Celebration confetti!
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: ['#6366f1', '#a855f7', '#ec4899']
                });

                setNewPostContent('');
                setSelectedImage(null);
                setShowNewPost(false);
                await loadEventWall();
            } else {
                alert(`Failed to create post: ${responseData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Check console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');

            if (!currentParticipantId) {
                console.error('No current participant ID found');
                return;
            }

            // Find the current post
            const post = posts.find(p => p.id === postId);
            const isLiked = post?.user_has_liked;

            // Optimistic UI update
            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, user_has_liked: !isLiked, like_count: (p.like_count || 0) + (isLiked ? -1 : 1) }
                    : p
            ));

            if (isLiked) {
                // Unlike
                await fetch(`${API_URL}/wall/${eventId}/posts/${postId}/like/${currentParticipantId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Like
                await fetch(`${API_URL}/wall/${eventId}/posts/${postId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ participantId: currentParticipantId })
                });
            }

            // Reload to get accurate count from server
            await loadEventWall();
        } catch (error) {
            console.error('Error toggling like:', error);
            // Reload on error to restore correct state
            await loadEventWall();
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/wall/${eventId}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // Remove post from UI
                setPosts(posts.filter(p => p.id !== postId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    };


    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #0a0b1e, #101127)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: '#a5b4fc', fontSize: '18px', fontWeight: 600 }}>
                    Loading event wall...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fff'
        }}>

            {/* Event Header */}
            <div style={{
                background: '#fff',
                padding: '20px 16px',
                borderBottom: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#a5b4fc'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                        }}>
                            {event?.title || 'Event Wall'}
                        </h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '4px'
                        }}>
                            <Users size={14} color="#6b7280" />
                            <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>
                                {participants.length} participants
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewPost(true)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            background: '#6366f1',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Plus size={16} strokeWidth={3} /> Post
                    </button>
                </div>
            </div>

            {/* New Post Modal */}
            {
                showNewPost && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '600px',
                            background: '#fff',
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px',
                            padding: '24px',
                            paddingBottom: 'calc(24px + 60px + env(safe-area-inset-bottom))',
                            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                                    New Post
                                </h3>
                                <button
                                    onClick={() => setShowNewPost(false)}
                                    style={{
                                        background: '#f3f4f6',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Image Picker */}
                            <button
                                onClick={pickImage}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: '#f3f4f6',
                                    border: '1px solid #e5e7eb',
                                    color: '#6b7280',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    marginBottom: '12px'
                                }}
                            >
                                <ImageIcon size={18} /> Add Photo
                            </button>

                            {/* Image Preview */}
                            {selectedImage && (
                                <div style={{ position: 'relative', marginBottom: '12px' }}>
                                    <img
                                        src={selectedImage}
                                        style={{
                                            width: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }}
                                        alt="Selected"
                                    />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(0,0,0,0.6)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#fff'
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}

                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What's on your mind?"
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    background: '#fff',
                                    border: '1px solid #e5e7eb',
                                    color: '#1f2937',
                                    fontSize: '15px',
                                    resize: 'vertical',
                                    marginBottom: '16px',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <button
                                onClick={handleCreatePost}
                                disabled={!newPostContent.trim() || isSubmitting}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: (newPostContent.trim() && !isSubmitting)
                                        ? '#6366f1'
                                        : '#f3f4f6',
                                    border: 'none',
                                    color: (newPostContent.trim() && !isSubmitting) ? '#ffffff' : '#9ca3af',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    cursor: (newPostContent.trim() && !isSubmitting) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: isSubmitting ? 0.6 : 1
                                }}
                            >
                                <Send size={18} strokeWidth={2.5} />
                                {isSubmitting ? 'Posting...' : 'Post to Wall'}
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Posts Feed */}
            <div style={{
                padding: '16px',
                paddingBottom: 'max(80px, env(safe-area-inset-bottom))'
            }}>
                {posts.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <MessageSquare size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                            No posts yet
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                            Be the first to share something!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {post.is_pinned && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                        color: '#000',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        📌 Pinned
                                    </div>
                                )}

                                {/* Author */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    {post.author_profile_picture ? (
                                        <img
                                            src={post.author_profile_picture}
                                            alt={post.author_name}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #e5e7eb'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            fontWeight: 900,
                                            fontSize: '16px'
                                        }}>
                                            {post.author_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#1f2937', fontWeight: '600', fontSize: '15px' }}>
                                            {post.author_name}
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {/* Delete Button - only for event owner or post author */}
                                    {(currentUserId === event?.user_id || currentUserId === post.author_user_id) && (
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'transparent',
                                                border: '1px solid #e5e7eb',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#fee2e2';
                                                e.currentTarget.style.borderColor = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                            }}
                                            title="Delete post"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                <p style={{
                                    color: '#1f2937',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    margin: '0 0 16px 0',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {post.content}
                                </p>

                                {/* Post Image */}
                                {post.photo_url && (
                                    <img
                                        src={post.photo_url}
                                        style={{
                                            width: '100%',
                                            maxHeight: '400px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            marginTop: '12px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => window.open(post.photo_url, '_blank')}
                                        alt="Post image"
                                    />
                                )}

                                {/* Actions */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid #e5e7eb'
                                }}>
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: 'none',
                                            border: 'none',
                                            color: post.user_has_liked ? '#f87171' : '#6b7280',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        <Heart size={18} fill={post.user_has_liked ? '#f87171' : 'none'} /> {post.like_count || 0}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default EventWall;
