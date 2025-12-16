import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AlertCircle, Camera, X, ArrowLeft, HelpCircle, Image, Flashlight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QRScanner = ({ onScan, onError, onClose }) => {
    const [error, setError] = useState('');
    const [hasPermission, setHasPermission] = useState(null);
    const [torchOn, setTorchOn] = useState(false);
    const scannerRef = useRef(null);
    const isRunning = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        const scannerId = "reader";

        const startScanner = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (!devices || devices.length === 0) {
                    setError('No camera found on this device.');
                    return;
                }

                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode(scannerId);
                }

                const config = {
                    fps: 10,
                    qrbox: { width: 280, height: 280 },
                    aspectRatio: 1.0,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                };

                if (!isRunning.current) {
                    await scannerRef.current.start(
                        { facingMode: "environment" },
                        config,
                        (decodedText) => {
                            try {
                                const data = JSON.parse(decodedText);
                                onScan(data);
                            } catch (e) {
                                console.warn("Non-JSON QR Code", e);
                            }
                        },
                        (errorMessage) => { }
                    );
                    isRunning.current = true;
                    setHasPermission(true);
                }
            } catch (err) {
                console.error("Camera start failed", err);
                setHasPermission(false);
                if (err.name === 'NotAllowedError') {
                    setError('Camera permission denied. Please allow camera access in your browser settings.');
                } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                    setError('Camera access requires a secure HTTPS connection.');
                } else {
                    setError(`Camera error: ${err.message || err}`);
                }
            }
        };

        const timeout = setTimeout(startScanner, 100);

        return () => {
            clearTimeout(timeout);
            if (scannerRef.current && isRunning.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                    isRunning.current = false;
                }).catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, [onScan]);

    const toggleTorch = async () => {
        if (scannerRef.current && isRunning.current) {
            try {
                const track = scannerRef.current.getRunningTrackCapabilities();
                if (track && track.torch) {
                    await scannerRef.current.applyVideoConstraints({
                        advanced: [{ torch: !torchOn }]
                    });
                    setTorchOn(!torchOn);
                }
            } catch (err) {
                console.warn('Torch not supported', err);
            }
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'black', paddingTop: 'env(safe-area-inset-top)' }}>
            {/* Camera View */}
            <div id="reader" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}></div>

            {/* Header Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Title */}
                    <div style={{ flex: 1, margin: '0 16px' }}>
                        <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 600, margin: 0 }}>Scan Guest Pass</h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>Quick & Secure Check-in</p>
                    </div>

                    {/* Help Button */}
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                        <HelpCircle size={20} />
                    </button>
                </div>
            </div>

            {/* Scanning Frame Overlay */}
            {hasPermission && !error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
                    {/* Dark overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>

                    {/* Frosted scanning frame */}
                    <div style={{ position: 'relative', width: '288px', height: '288px', borderRadius: '24px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(99,102,241,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {/* Purple Corner Brackets */}
                        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '48px', height: '48px', borderTop: '4px solid #a855f7', borderLeft: '4px solid #a855f7', borderTopLeftRadius: '12px' }}></div>
                        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '48px', height: '48px', borderTop: '4px solid #a855f7', borderRight: '4px solid #a855f7', borderTopRightRadius: '12px' }}></div>
                        <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '48px', height: '48px', borderBottom: '4px solid #a855f7', borderLeft: '4px solid #a855f7', borderBottomLeftRadius: '12px' }}></div>
                        <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '48px', height: '48px', borderBottom: '4px solid #a855f7', borderRight: '4px solid #a855f7', borderBottomRightRadius: '12px' }}></div>

                        {/* Scanning Line Animation */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, transparent, #c084fc, transparent)', boxShadow: '0 0 15px rgba(168,85,247,0.8)', animation: 'scan 2s ease-in-out infinite' }}></div>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            {hasPermission && !error && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40, paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', paddingBottom: '48px' }}>
                        {/* Upload from Gallery */}
                        <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', background: 'none', border: 'none' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Image size={24} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>Upload QR</span>
                        </button>

                        {/* Torch */}
                        <button onClick={toggleTorch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', background: 'none', border: 'none' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backdropFilter: 'blur(4px)', border: `1px solid ${torchOn ? 'rgba(234,179,8,0.5)' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: torchOn ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.1)', color: torchOn ? '#fde047' : 'white', transition: 'all 0.3s' }}>
                                <Flashlight size={24} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>Torch</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {!hasPermission && !error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
                    <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Camera size={64} style={{ marginBottom: '16px', animation: 'pulse 2s ease-in-out infinite' }} />
                        <p style={{ fontSize: '18px', fontWeight: 500 }}>Starting Camera...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, padding: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '32px', maxWidth: '28rem', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171' }}>
                        <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>{error}</p>
                        {hasPermission === false && (
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '16px' }}>
                                If you are on iOS, make sure you are using Safari. Chrome on iOS may have permission issues.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
