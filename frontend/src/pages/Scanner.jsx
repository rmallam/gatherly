import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import { CheckCircle, XCircle, Users, ArrowRight, RefreshCcw, ScanLine, Lock, X, Ticket } from 'lucide-react';
import './Scanner.css';

const Scanner = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { events, markGuestAttended } = useApp();
    const [scanResult, setScanResult] = useState(null);
    const [guestCount, setGuestCount] = useState(1);

    // Check if user is an organizer (has created events)
    const isOrganizer = events && events.length > 0 && !user?.isGuest;

    // Show unauthorized message if not an organizer
    if (!isOrganizer) {
        return (
            <div className="unauthorized-page">
                <div className="unauthorized-card">
                    <div className="lock-icon-circle">
                        <Lock size={40} />
                    </div>
                    <h1>Organizer Access Only</h1>
                    <p>
                        This feature is reserved for event organizers to check in guests.
                        Please create an event to access the scanner.
                    </p>
                    <button onClick={() => navigate('/')} className="btn-home">
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
            setScanResult({ status: 'invalid', message: 'Invalid QR Code' });
            return;
        }

        const event = events.find(e => e.id === data.eventId);
        if (!event) {
            setScanResult({ status: 'invalid', message: 'Event not found' });
            return;
        }

        // Verify event belongs to current user
        if (event.user_id !== user?.id) {
            setScanResult({ status: 'invalid', message: 'Unauthorized Event' });
            return;
        }

        const guest = event.guests?.find(g => g.id === data.guestId);
        if (!guest) {
            setScanResult({ status: 'invalid', message: 'Guest not found' });
            return;
        }

        // If guest already attended, show warning/info but allow adding more
        if (guest.attended) {
            setScanResult({
                status: 'checked-in',
                data: { event, guest },
                message: 'Already Checked In'
            });
        } else {
            setScanResult({
                status: 'valid',
                data: { event, guest },
                message: 'Ticket Valid'
            });
        }
    };

    const handleCheckIn = () => {
        if (!scanResult?.data) return;
        const { event, guest } = scanResult.data;
        markGuestAttended(event.id, guest.id, guestCount);

        // Show success state briefly or just reset
        // For now, let's show a success confirmation then reset
        // But since we want to be fast, maybe just reset or show a toast?
        // Let's transition to a "Success" view locally before resetting
        setScanResult({
            status: 'success-confirmed',
            data: { event, guest, count: guestCount }
        });

        // Auto reset after 2 seconds
        setTimeout(() => {
            resetScanner();
        }, 2000);
    };

    return (
        <div className="scanner-page">
            <div className="scanner-container">
                {/* Always render scanner in background, pause when result shown if possible, 
                    but simpler to just overlay result */}
                <QRScanner onScan={handleScan} hideHeader={true} /> {/* Add paused={!!scanResult} if component supports it */}

                {/* Header Overlay */}
                <div className="scanner-header">
                    <div className="scanner-title-badge">
                        <ScanLine size={18} className="text-indigo-400" />
                        <h1>Scanner</h1>
                    </div>
                    <button onClick={() => navigate(-1)} className="close-btn">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Result Overlay */}
            {scanResult && (
                <div className="scanner-result-overlay">

                    {/* VALID TICKET */}
                    {scanResult.status === 'valid' && (
                        <div className="result-card valid">
                            <div className="result-header">
                                <div className="status-icon-wrapper">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="result-title">Valid Ticket</h2>
                                <p className="result-subtitle">Access Granted</p>
                            </div>
                            <div className="result-body">
                                <div className="guest-info">
                                    <h3 className="guest-name">{scanResult.data.guest.name}</h3>
                                    <div className="event-name">
                                        <Ticket size={14} />
                                        {scanResult.data.event.title}
                                    </div>
                                </div>

                                <div className="party-control">
                                    <label className="party-label">Party Size</label>
                                    <div className="party-stepper">
                                        <button
                                            className="stepper-btn"
                                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="party-value">{guestCount}</span>
                                        <button
                                            className="stepper-btn"
                                            onClick={() => setGuestCount(guestCount + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="result-actions">
                                    <button onClick={resetScanner} className="btn-scan-action btn-cancel">
                                        Cancel
                                    </button>
                                    <button onClick={handleCheckIn} className="btn-scan-action btn-confirm">
                                        Check In <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ALREADY CHECKED IN */}
                    {scanResult.status === 'checked-in' && (
                        <div className="result-card checked-in">
                            <div className="result-header">
                                <div className="status-icon-wrapper">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="result-title">Already Checked In</h2>
                                <p className="result-subtitle">
                                    Previously: {scanResult.data.guest.attendedCount || 1} guests
                                </p>
                            </div>
                            <div className="result-body">
                                <div className="guest-info">
                                    <h3 className="guest-name">{scanResult.data.guest.name}</h3>
                                    <div className="event-name">
                                        <Ticket size={14} />
                                        {scanResult.data.event.title}
                                    </div>
                                </div>

                                <div className="party-control">
                                    <label className="party-label">Add More Guests?</label>
                                    <div className="party-stepper">
                                        <button
                                            className="stepper-btn"
                                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="party-value">{guestCount}</span>
                                        <button
                                            className="stepper-btn"
                                            onClick={() => setGuestCount(guestCount + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="result-actions">
                                    <button onClick={resetScanner} className="btn-scan-action btn-cancel">
                                        Cancel
                                    </button>
                                    <button onClick={handleCheckIn} className="btn-scan-action btn-confirm">
                                        Add Guests <Users size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INVALID TICKET */}
                    {scanResult.status === 'invalid' && (
                        <div className="result-card invalid">
                            <div className="result-header">
                                <div className="status-icon-wrapper">
                                    <XCircle size={40} />
                                </div>
                                <h2 className="result-title">Invalid Ticket</h2>
                                <p className="result-subtitle">{scanResult.message}</p>
                            </div>
                            <div className="result-body">
                                <button onClick={resetScanner} className="btn-scan-action btn-confirm btn-full">
                                    <RefreshCcw size={18} /> Scan Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS CONFIRMED (Transient State) */}
                    {scanResult.status === 'success-confirmed' && (
                        <div className="result-card valid">
                            <div className="result-header">
                                <div className="status-icon-wrapper" style={{ background: '#10b981', color: 'white' }}>
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="result-title">Success!</h2>
                                <p className="result-subtitle">
                                    Checked in {scanResult.data.count} guest(s)
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default Scanner;
