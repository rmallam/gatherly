import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Send, ArrowLeft, Plus, Users, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const EventWall = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [event, setEvent] = useState(null);

    useEffect(() => {
        loadEventWall();
    }, [eventId]);

    const loadEventWall = async () => {
        try {
            const token = localStorage.getItem('token');

            // Auto-join event wall first
            await fetch(`${API_URL}/api/events/${eventId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Load posts
            const postsRes = await fetch(`${API_URL}/api/events/${eventId}/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const postsData = await postsRes.json();
            setPosts(postsData.posts || []);

            // Load participants
            const participantsRes = await fetch(`${API_URL}/api/events/${eventId}/participants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const participantsData = await participantsRes.json();
            setParticipants(participantsData.participants || []);

            setLoading(false);
        } catch (error) {
            console.error('Error loading event wall:', error);
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;

        try {
            const token = localStorage.getItem('token');

            // Reload participants to get fresh data including the auto-joined participant
            const participantsRes = await fetch(`${API_URL}/api/events/${eventId}/participants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const participantsData = await participantsRes.json();
            const currentParticipants = participantsData.participants || [];

            console.log('Reloaded participants for posting:', currentParticipants);

            // Use the first participant (should be current user)
            const myParticipant = currentParticipants[0];

            console.log('My participant:', myParticipant);

            if (!myParticipant) {
                alert('Unable to post - no participant found. Please refresh the page.');
                console.error('No participant found after reload');
                return;
            }

            console.log('Attempting to create post with participantId:', myParticipant.id);

            const res = await fetch(`${API_URL}/api/events/${eventId}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: myParticipant.id,
                    type: 'message',
                    content: newPostContent
                })
            });

            console.log('Post creation response status:', res.status);
            const responseData = await res.json();
            console.log('Post creation response data:', responseData);

            if (res.ok) {
                setNewPostContent('');
                setShowNewPost(false);
                await loadEventWall();
            } else {
                alert(`Failed to create post: ${responseData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Check console for details.');
        }
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const participantId = participants[0]?.id;

            await fetch(`${API_URL}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantId })
            });

            loadEventWall();
        } catch (error) {
            console.error('Error liking post:', error);
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
            background: 'linear-gradient(to bottom, #0a0b1e, #101127, #0a0b1e)',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))',
                padding: '20px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
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
                            fontSize: '24px',
                            fontWeight: 900,
                            color: '#ffffff',
                            margin: 0
                        }}>
                            Event Wall
                        </h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '4px'
                        }}>
                            <Users size={14} color="#a5b4fc" />
                            <span style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 500 }}>
                                {participants.length} participants
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewPost(true)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                        }}
                    >
                        <Plus size={16} strokeWidth={3} /> Post
                    </button>
                </div>
            </div>

            {/* New Post Modal */}
            {showNewPost && (
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
                        background: 'linear-gradient(to bottom, #1a1c38, #0a0b1e)',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderBottom: 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 900, margin: 0 }}>
                                New Post
                            </h3>
                            <button
                                onClick={() => setShowNewPost(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    color: '#a5b4fc',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="What's on your mind?"
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#ffffff',
                                fontSize: '16px',
                                resize: 'vertical',
                                marginBottom: '16px',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim()}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: newPostContent.trim()
                                    ? 'linear-gradient(to right, #10b981, #14b8a6)'
                                    : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#ffffff',
                                fontWeight: 900,
                                fontSize: '16px',
                                cursor: newPostContent.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: newPostContent.trim() ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                            }}
                        >
                            <Send size={18} strokeWidth={2.5} /> Post to Wall
                        </button>
                    </div>
                </div>
            )}

            {/* Posts Feed */}
            <div style={{ padding: '16px' }}>
                {posts.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <MessageSquare size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>
                            No posts yet
                        </h3>
                        <p style={{ color: '#a5b4fc', fontSize: '14px', margin: 0 }}>
                            Be the first to share something!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '16px',
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
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>
                                            {post.author_name}
                                        </div>
                                        <div style={{ color: '#a5b4fc', fontSize: '12px' }}>
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <p style={{
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    margin: '0 0 16px 0',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {post.content}
                                </p>

                                {/* Actions */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: 'none',
                                            border: 'none',
                                            color: '#f87171',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }}
                                    >
                                        <Heart size={18} /> {post.like_count || 0}
                                    </button>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: '#a5b4fc',
                                        fontSize: '14px',
                                        fontWeight: 600
                                    }}>
                                        <MessageSquare size={18} /> {post.comment_count || 0}
                                    </div>
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
