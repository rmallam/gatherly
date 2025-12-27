import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import { CheckCircle, XCircle, Users, ArrowRight, RefreshCcw, ScanLine, Lock } from 'lucide-react';

const Scanner = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { events, markGuestAttended } = useApp();
    const [scanResult, setScanResult] = useState(null);
    const [guestCount, setGuestCount] = useState(1);
    const [selectedEventId, setSelectedEventId] = useState('');

    // Check if user is an organizer (has created events)
    const isOrganizer = events && events.length > 0 && !user?.isGuest;

    // Show unauthorized message if not an organizer
    if (!isOrganizer) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #0a0b1e, #101127, #0a0b1e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    maxWidth: '400px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '3rem 2rem'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '20px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        marginBottom: '1.5rem'
                    }}>
                        <Lock size={48} color="#ef4444" />
                    </div>

                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '1rem'
                    }}>
                        Unauthorized Access
                    </h1>

                    <p style={{
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '2rem',
                        lineHeight: '1.6'
                    }}>
                        Only event organizers can access the QR code scanner. Please create an event to use this feature.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.875rem'
                        }}
                    >
                        Go to Events
                    </button>
                </div>
            </div>
        );
    }

    const resetScanner = () => {
        setScanResult(null);
        setGuestCount(1);
    };

    const handleScan = (data) => {
        if (scanResult) return;

        if (!data.eventId || !data.guestId) {
            setScanResult({ status: 'invalid', message: 'Invalid QR Code structure' });
            return;
        }

        const event = events.find(e => e.id === data.eventId);
        if (!event) {
            setScanResult({ status: 'invalid', message: 'Event not found. You can only check in guests for your own events.' });
            return;
        }

        // Verify event belongs to current user
        if (event.user_id !== user?.id) {
            setScanResult({ status: 'invalid', message: 'Unauthorized. You can only check in guests for your own events.' });
            return;
        }

        const guest = event.guests?.find(g => g.id === data.guestId);
        if (!guest) {
            setScanResult({ status: 'invalid', message: 'Guest not found in guest list' });
            return;
        }

        setScanResult({
            status: 'valid',
            data: { event, guest },
            message: 'Guest Verified'
        });
    };

    const handleCheckIn = () => {
        if (scanResult?.status !== 'valid') return;
        const { event, guest } = scanResult.data;
        markGuestAttended(event.id, guest.id, guestCount);
        setScanResult({ ...scanResult, status: 'checked-in' });
    };

    return (
        <>
            {!scanResult && (
                <QRScanner onScan={handleScan} onClose={resetScanner} />
            )}

            {scanResult && (
                <div style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(to bottom, #0a0b1e, #101127, #0a0b1e)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{ padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))',
                            opacity: 0.5
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                padding: '16px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 8px 32px rgba(99,102,241,0.2)',
                                marginBottom: '12px'
                            }}>
                                <ScanLine size={40} color="#a5b4fc" strokeWidth={2.5} />
                            </div>

                            <h1 style={{
                                fontSize: '40px',
                                fontWeight: 900,
                                background: 'linear-gradient(to right, #ffffff, #c7d2fe, #ffffff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: '12px 0',
                                letterSpacing: '-0.5px'
                            }}>
                                Gatekeeper
                            </h1>
                            <p style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'rgba(196,181,253,0.6)',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                margin: 0
                            }}>
                                Guest Check-In
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '0 16px 24px' }}>
                        {/* Valid Result */}
                        {scanResult.status === 'valid' && (
                            <div style={{ maxWidth: '448px', margin: '0 auto' }}>
                                <div style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 20px 40px rgba(99,102,241,0.1)',
                                    padding: '32px'
                                }}>
                                    {/* Decorative glows */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-80px',
                                        right: '-80px',
                                        width: '160px',
                                        height: '160px',
                                        background: 'rgba(99,102,241,0.2)',
                                        borderRadius: '50%',
                                        filter: 'blur(60px)'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-80px',
                                        left: '-80px',
                                        width: '160px',
                                        height: '160px',
                                        background: 'rgba(168,85,247,0.2)',
                                        borderRadius: '50%',
                                        filter: 'blur(60px)'
                                    }}></div>

                                    <div style={{ position: 'relative', zIndex: 10 }}>
                                        {/* Avatar */}
                                        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 32px' }}>
                                            <div style={{
                                                width: '128px',
                                                height: '128px',
                                                background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 20px 40px rgba(99,102,241,0.3)',
                                                border: '4px solid rgba(255,255,255,0.1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                    animation: 'shimmer 2s infinite'
                                                }}></div>
                                                <Users size={56} color="#ffffff" strokeWidth={2} style={{ position: 'relative', zIndex: 10 }} />
                                            </div>

                                            {scanResult.data.guest.attended && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '-8px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    whiteSpace: 'nowrap',
                                                    background: 'linear-gradient(to right, #fbbf24, #f97316)',
                                                    color: '#000',
                                                    padding: '6px 16px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: 900,
                                                    boxShadow: '0 8px 16px rgba(251,191,36,0.4)',
                                                    border: '2px solid rgba(255,255,255,0.5)',
                                                    animation: 'bounce 1s infinite'
                                                }}>
                                                    ✓ CHECKED IN {scanResult.data.guest.attendedCount || 1}×
                                                </div>
                                            )}
                                        </div>

                                        {/* Guest Info */}
                                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                            <h2 style={{
                                                fontSize: '36px',
                                                fontWeight: 900,
                                                color: '#ffffff',
                                                margin: '0 0 16px 0',
                                                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                            }}>
                                                {scanResult.data.guest.name}
                                            </h2>

                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                backdropFilter: 'blur(10px)'
                                            }}>
                                                <span style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: '#a5b4fc',
                                                    animation: 'pulse 2s infinite',
                                                    boxShadow: '0 0 10px rgba(165,180,252,0.5)'
                                                }}></span>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: 'rgba(255,255,255,0.9)'
                                                }}>
                                                    {scanResult.data.event.title}
                                                </span>
                                            </div>

                                            {scanResult.data.guest.attended && (
                                                <div style={{
                                                    marginTop: '16px',
                                                    padding: '16px',
                                                    background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(249,115,22,0.1))',
                                                    border: '1px solid rgba(251,191,36,0.3)',
                                                    borderRadius: '16px',
                                                    backdropFilter: 'blur(10px)'
                                                }}>
                                                    <p style={{
                                                        color: '#fcd34d',
                                                        fontWeight: 700,
                                                        fontSize: '14px',
                                                        margin: '0 0 4px 0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        ⚠️ Already Checked In
                                                    </p>
                                                    <p style={{
                                                        color: 'rgba(255,255,255,0.6)',
                                                        fontSize: '12px',
                                                        margin: 0
                                                    }}>
                                                        Add more guests to their party below
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Guest Counter */}
                                        <div style={{
                                            background: 'rgba(0,0,0,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            marginBottom: '24px'
                                        }}>
                                            <label style={{
                                                fontSize: '11px',
                                                fontWeight: 900,
                                                color: 'rgba(255,255,255,0.5)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '2px',
                                                display: 'block',
                                                textAlign: 'center',
                                                marginBottom: '16px'
                                            }}>
                                                {scanResult.data.guest.attended ? '+ Additional Guests' : 'Party Size'}
                                            </label>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '24px'
                                            }}>
                                                <button
                                                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                    style={{
                                                        width: '56px',
                                                        height: '56px',
                                                        borderRadius: '16px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'rgba(255,255,255,0.7)',
                                                        fontSize: '24px',
                                                        fontWeight: 900,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    −
                                                </button>
                                                <span style={{
                                                    fontSize: '48px',
                                                    fontWeight: 900,
                                                    width: '64px',
                                                    textAlign: 'center',
                                                    background: 'linear-gradient(135deg, #ffffff, #c7d2fe)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                                }}>
                                                    {guestCount}
                                                </span>
                                                <button
                                                    onClick={() => setGuestCount(guestCount + 1)}
                                                    style={{
                                                        width: '56px',
                                                        height: '56px',
                                                        borderRadius: '16px',
                                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                                        border: 'none',
                                                        color: '#ffffff',
                                                        fontSize: '24px',
                                                        fontWeight: 900,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 8px 16px rgba(99,102,241,0.5)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <button
                                                onClick={resetScanner}
                                                style={{
                                                    height: '56px',
                                                    borderRadius: '16px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCheckIn}
                                                style={{
                                                    height: '56px',
                                                    borderRadius: '16px',
                                                    background: 'linear-gradient(to right, #10b981, #14b8a6)',
                                                    border: 'none',
                                                    color: '#ffffff',
                                                    fontWeight: 900,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 8px 16px rgba(16,185,129,0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {scanResult.data.guest.attended ? 'Add Guests' : 'Check In'}
                                                <ArrowRight size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invalid Result */}
                        {scanResult.status === 'invalid' && (
                            <div style={{ maxWidth: '448px', margin: '0 auto' }}>
                                <div style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    boxShadow: '0 20px 40px rgba(239,68,68,0.1)',
                                    padding: '32px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-80px',
                                        right: '-80px',
                                        width: '160px',
                                        height: '160px',
                                        background: 'rgba(239,68,68,0.2)',
                                        borderRadius: '50%',
                                        filter: 'blur(60px)'
                                    }}></div>

                                    <div style={{ position: 'relative', zIndex: 10 }}>
                                        <div style={{
                                            width: '112px',
                                            height: '112px',
                                            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))',
                                            color: '#f87171',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 24px',
                                            animation: 'pulse 2s infinite',
                                            border: '4px solid rgba(239,68,68,0.2)',
                                            boxShadow: '0 20px 40px rgba(239,68,68,0.2)'
                                        }}>
                                            <XCircle size={64} strokeWidth={2.5} />
                                        </div>

                                        <h2 style={{
                                            fontSize: '36px',
                                            fontWeight: 900,
                                            color: '#ffffff',
                                            margin: '0 0 12px 0',
                                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                        }}>
                                            Invalid Ticket
                                        </h2>
                                        <p style={{
                                            color: '#fca5a5',
                                            fontWeight: 600,
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '12px 20px',
                                            borderRadius: '16px',
                                            display: 'inline-block',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            margin: '0 0 24px 0'
                                        }}>
                                            {scanResult.message}
                                        </p>

                                        <button
                                            onClick={resetScanner}
                                            style={{
                                                width: '100%',
                                                height: '56px',
                                                borderRadius: '16px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '2px solid rgba(239,68,68,0.5)',
                                                color: '#fca5a5',
                                                fontWeight: 900,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Scan Next Ticket
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Checked-In Success */}
                        {scanResult.status === 'checked-in' && (
                            <div style={{ maxWidth: '448px', margin: '0 auto' }}>
                                <div style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    boxShadow: '0 20px 40px rgba(16,185,129,0.2)',
                                    padding: '32px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-80px',
                                        right: '-80px',
                                        width: '160px',
                                        height: '160px',
                                        background: 'rgba(16,185,129,0.2)',
                                        borderRadius: '50%',
                                        filter: 'blur(60px)'
                                    }}></div>

                                    <div style={{ position: 'relative', zIndex: 10 }}>
                                        <div style={{
                                            width: '112px',
                                            height: '112px',
                                            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                                            color: '#ffffff',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 24px',
                                            boxShadow: '0 20px 40px rgba(16,185,129,0.5)',
                                            animation: 'bounce 1s infinite'
                                        }}>
                                            <CheckCircle size={64} strokeWidth={2.5} />
                                        </div>

                                        <h2 style={{
                                            fontSize: '36px',
                                            fontWeight: 900,
                                            background: 'linear-gradient(to right, #ffffff, #d1fae5)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            margin: '0 0 12px 0',
                                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                        }}>
                                            Access Granted
                                        </h2>
                                        <p style={{
                                            color: '#6ee7b7',
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            margin: '0 0 12px 0'
                                        }}>
                                            Welcome, {scanResult.data.guest.name}!
                                        </p>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            color: 'rgba(255,255,255,0.6)',
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            margin: '0 0 24px 0'
                                        }}>
                                            Total Party: <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '18px' }}>{guestCount}</span>
                                        </div>

                                        <button
                                            onClick={resetScanner}
                                            style={{
                                                width: '100%',
                                                height: '64px',
                                                borderRadius: '16px',
                                                background: 'linear-gradient(to right, #6366f1, #a855f7)',
                                                border: 'none',
                                                color: '#ffffff',
                                                fontSize: '18px',
                                                fontWeight: 900,
                                                cursor: 'pointer',
                                                boxShadow: '0 8px 16px rgba(99,102,241,0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '12px',
                                                margin: '0 auto',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <RefreshCcw size={24} strokeWidth={2.5} /> Scan Next Guest
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Scanner;
