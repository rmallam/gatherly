import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MessageSquare, Heart, Send, ArrowLeft, Plus, Users, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import API_URL from '../config/api';
import { Camera } from '@capacitor/camera';
import Header from '../components/Header';
import confetti from 'canvas-confetti';
import './EventWall.css';

const EventWall = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { getEvent } = useApp(); // Assume useApp is imported
    const contextEvent = getEvent(eventId);
    const [event, setEvent] = useState(contextEvent || null);
    const [posts, setPosts] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [currentParticipantId, setCurrentParticipantId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Safety cleanup
    useEffect(() => {
        return () => confetti.reset();
    }, []);

    // Update local state if context updates (e.g. after edit)
    useEffect(() => {
        if (contextEvent) {
            setEvent(contextEvent);
        }
    }, [contextEvent]);

    useEffect(() => {
        loadEventWall();
    }, [eventId]);

    const loadEventWall = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch event details (only if not already loaded from context, or to refresh)
            if (!event) {
                const eventRes = await fetch(`${API_URL}/wall/${eventId}/details`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (eventRes.ok) {
                    const eventData = await eventRes.json();
                    setEvent(eventData);
                }
            }

            // Auto-join event wall first
            const joinRes = await fetch(`${API_URL}/wall/${eventId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!joinRes.ok) {
                const errorText = await joinRes.text();
                console.error('Join failed:', joinRes.status, errorText.substring(0, 200));
                // Don't throw here, trying to load read-only view might still be possible
            } else {
                const joinData = await joinRes.json();
                console.log('Join response:', joinData);
                if (joinData.participant && joinData.participant.id) {
                    console.log('Setting current participant ID from join:', joinData.participant.id);
                    setCurrentParticipantId(joinData.participant.id);
                }
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

            // Fallback: Find current user in list if not set via join
            if (!currentParticipantId) {
                const currentParticipant = participantsList.find(p => p.is_current_user);
                if (currentParticipant) {
                    console.log('Found participant in list:', currentParticipant.id);
                    setCurrentParticipantId(currentParticipant.id);
                }
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
                    colors: ['#6366f1', '#a855f7', '#ec4899'],
                    zIndex: 2000
                });

                if (responseData.post) {
                    setPosts(prev => [responseData.post, ...prev]);
                } else {
                    // Fallback to reload if no post returned
                    await loadEventWall();
                }

                setNewPostContent('');
                setSelectedImage(null);
                setShowNewPost(false);
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
            <div className="wall-loading">
                Displaying event wall...
            </div>
        );
    }

    return (
        <div className="event-wall-container">
            {/* Event Header */}
            <div className="wall-header">
                <button
                    onClick={() => navigate(-1)}
                    className="wall-back-btn"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="wall-title-box">
                    <h1 className="wall-title">
                        {event?.title || 'Event Wall'}
                    </h1>
                    <div className="wall-subtitle">
                        <Users size={12} color="#94a3b8" />
                        <span>{participants.length} participants</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowNewPost(true)}
                    className="post-btn"
                >
                    <Plus size={16} strokeWidth={3} /> Post
                </button>
            </div>

            {/* New Post Modal */}
            {
                showNewPost && (
                    <div className="modal-overlay" onClick={() => setShowNewPost(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">New Post</h3>
                                <button
                                    onClick={() => setShowNewPost(false)}
                                    className="modal-cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Image Picker */}
                            <button
                                onClick={pickImage}
                                className="image-picker-btn"
                            >
                                <ImageIcon size={20} />
                                {selectedImage ? 'Change Photo' : 'Add Photo'}
                            </button>

                            {/* Image Preview */}
                            {selectedImage && (
                                <div className="image-preview-container">
                                    <img
                                        src={selectedImage}
                                        className="image-preview"
                                        alt="Selected"
                                    />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="remove-image-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}

                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Share a memory, wish, or fun fact..."
                                className="post-textarea"
                            />

                            <button
                                onClick={handleCreatePost}
                                disabled={(!newPostContent.trim() && !selectedImage) || isSubmitting}
                                className="submit-post-btn"
                            >
                                {isSubmitting ? (
                                    'Posting...'
                                ) : (
                                    <>
                                        <Send size={18} strokeWidth={2.5} />
                                        Post to Wall
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Posts Feed */}
            <div className="wall-feed">
                {posts.length === 0 ? (
                    <div className="empty-wall-state">
                        <MessageSquare size={48} color="#6366f1" style={{ opacity: 0.5 }} />
                        <h3 className="empty-wall-title">No posts yet</h3>
                        <p className="empty-wall-desc">
                            Be the first to share a moment!
                        </p>
                    </div>
                ) : (
                    <div className="posts-list">
                        {posts.map((post) => (
                            <div key={post.id} className="post-card">
                                {post.is_pinned && (
                                    <div className="pinned-badge">
                                        📌 Pinned
                                    </div>
                                )}

                                {/* Author */}
                                <div className="post-header">
                                    {post.author_profile_picture ? (
                                        <img
                                            src={post.author_profile_picture}
                                            alt={post.author_name}
                                            className="author-avatar"
                                        />
                                    ) : (
                                        <div className="author-avatar-placeholder">
                                            {post.author_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div className="post-info">
                                        <div className="author-name">
                                            {post.author_name}
                                        </div>
                                        <div className="post-date">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {/* Delete Button */}
                                    {(currentUserId === event?.user_id || currentUserId === post.author_user_id) && (
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="delete-post-btn"
                                            title="Delete post"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                {post.content && (
                                    <p className="post-content">
                                        {post.content}
                                    </p>
                                )}

                                {/* Post Image */}
                                {post.photo_url && (
                                    <img
                                        src={post.photo_url}
                                        className="post-image"
                                        onClick={() => window.open(post.photo_url, '_blank')}
                                        alt="Post content"
                                    />
                                )}

                                {/* Actions */}
                                <div className="post-actions">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`action-btn ${post.user_has_liked ? 'liked' : ''}`}
                                    >
                                        <Heart
                                            size={20}
                                            fill={post.user_has_liked ? '#f87171' : 'none'}
                                            strokeWidth={post.user_has_liked ? 0 : 2}
                                        />
                                        {post.like_count || 0}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventWall;
