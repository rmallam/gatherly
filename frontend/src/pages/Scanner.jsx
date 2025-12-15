import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import QRScanner from '../components/QRScanner';
import { CheckCircle, XCircle, Users, ArrowRight, RefreshCcw, ScanLine } from 'lucide-react';

const Scanner = () => {
    const { events, markGuestAttended } = useApp();
    const [scanResult, setScanResult] = useState(null); // { status: 'idle' | 'valid' | 'invalid', data: null, message: '' }
    const [guestCount, setGuestCount] = useState(1);
    const [selectedEventId, setSelectedEventId] = useState(''); // If we want to filter by event, or just auto-detect

    // Auto-reset scanner after success/failure
    const resetScanner = () => {
        setScanResult(null);
        setGuestCount(1);
    };

    const handleScan = (data) => {
        if (scanResult) return; // Already processing

        // Schema: { eventId, guestId, name, valid }
        if (!data.eventId || !data.guestId) {
            setScanResult({ status: 'invalid', message: 'Invalid QR Code structure' });
            return;
        }

        // Verify Event Exists
        const event = events.find(e => e.id === data.eventId);
        if (!event) {
            setScanResult({ status: 'invalid', message: 'Event not found in this system' });
            return;
        }

        // Verify Guest Exists
        const guest = event.guests?.find(g => g.id === data.guestId);
        if (!guest) {
            setScanResult({ status: 'invalid', message: 'Guest not found in guest list' });
            return;
        }

        // Success! found guest
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

        // Show success feedback then reset
        setScanResult({ ...scanResult, status: 'checked-in' });
    };

    return (
        <>
            {/* Scanner View - Full Screen (no wrappers) */}
            {!scanResult && (
                <QRScanner onScan={handleScan} onClose={resetScanner} />
            )}

            {/* Result View */}
            {scanResult && (
                <div className="max-w-md mx-auto space-y-8 animate-in p-4">
                    <div className="text-center space-y-2">
                        <div className="inline-flex p-3 rounded-2xl bg-[rgba(6,182,212,0.1)] text-[var(--accent-cyan)] border border-[var(--glass-highlight)] mb-2">
                            <ScanLine size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Gatekeeper</h1>
                        <p className="text-[var(--text-muted)]">Scan result</p>
                    </div>
                </div>
            )}

            {/* Result View */}
            {scanResult && scanResult.status === 'valid' && (
                <div className="card text-center space-y-8 p-8 animate-in zoom-in duration-300 border-[var(--primary)] shadow-[0_0_50px_rgba(99,102,241,0.15)]">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-[rgba(99,102,241,0.2)]">
                            <Users size={40} />
                        </div>
                        {scanResult.data.guest.attended && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-[var(--bg-deep)]">
                                ✓ Checked in {scanResult.data.guest.attendedCount || 1}x
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">{scanResult.data.guest.name}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                            <span className="text-[var(--text-muted)] text-sm">{scanResult.data.event.title}</span>
                        </div>
                        {scanResult.data.guest.attended && (
                            <div className="mt-4 p-3 bg-[rgba(251,191,36,0.1)] border border-yellow-500/30 rounded-lg">
                                <p className="text-yellow-300 font-semibold text-sm">
                                    This guest has already checked in
                                </p>
                                <p className="text-[var(--text-muted)] text-xs mt-1">
                                    You can add more guests to their party below
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-[rgba(0,0,0,0.2)] p-6 rounded-2xl border border-[var(--glass-border)] space-y-3">
                        <label className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider">
                            {scanResult.data.guest.attended ? 'Additional Guests' : 'Number of Guests'}
                        </label>
                        <div className="flex items-center justify-center gap-6">
                            <button
                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
                            >
                                -
                            </button>
                            <span className="text-4xl font-bold w-12 text-white">{guestCount}</span>
                            <button
                                onClick={() => setGuestCount(guestCount + 1)}
                                className="w-12 h-12 rounded-xl bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <button onClick={resetScanner} className="btn btn-secondary h-12">
                            Cancel
                        </button>
                        <button onClick={handleCheckIn} className="btn btn-primary h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20">
                            {scanResult.data.guest.attended ? 'Add Additional Guests' : 'Check In'} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {scanResult && scanResult.status === 'invalid' && (
                <div className="card text-center space-y-6 p-8 animate-in zoom-in duration-300 border-[var(--error)] bg-[rgba(239,68,68,0.05)]">
                    <div className="w-24 h-24 bg-[rgba(239,68,68,0.1)] text-[var(--error)] rounded-full flex items-center justify-center mx-auto animate-pulse border-4 border-[rgba(239,68,68,0.1)]">
                        <XCircle size={48} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Invalid Ticket</h2>
                        <p className="text-[var(--text-muted)] font-medium bg-[rgba(0,0,0,0.2)] py-2 px-4 rounded-lg inline-block">{scanResult.message}</p>
                    </div>
                    <button onClick={resetScanner} className="btn btn-secondary w-full border-[var(--error)] text-[var(--error)] hover:bg-[rgba(239,68,68,0.1)]">
                        Scan Next Ticket
                    </button>
                </div>
            )}

            {scanResult && scanResult.status === 'checked-in' && (
                <div className="card text-center space-y-8 p-8 animate-in zoom-in duration-300 border-[var(--success)] bg-[rgba(16,185,129,0.05)]">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <CheckCircle size={48} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">Access Granted</h2>
                        <p className="text-[var(--success)] text-lg font-medium">Welcome, {scanResult.data.guest.name}!</p>
                        <div className="text-sm text-[var(--text-muted)] bg-[rgba(0,0,0,0.2)] py-1 px-3 rounded-full inline-block mt-2">
                            Total Party: <span className="text-white font-bold">{guestCount}</span>
                        </div>
                    </div>
                    <button onClick={resetScanner} className="btn btn-primary w-full gap-2 h-14 text-lg">
                        <RefreshCcw size={20} /> Scan Next Guest
                    </button>
                </div>
            )}
        </>
    );
};

export default Scanner;
