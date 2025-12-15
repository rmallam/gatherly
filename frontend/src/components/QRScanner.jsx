import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AlertCircle, Camera, X } from 'lucide-react';

const QRScanner = ({ onScan, onError, onClose }) => {
    const [error, setError] = useState('');
    const [hasPermission, setHasPermission] = useState(null);
    const scannerRef = useRef(null);
    const isRunning = useRef(false);

    useEffect(() => {
        const scannerId = "reader";

        const startScanner = async () => {
            try {
                // Check if camera exists
                const devices = await Html5Qrcode.getCameras();
                if (!devices || devices.length === 0) {
                    setError('No camera found on this device.');
                    return;
                }

                // Initialize scanner
                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode(scannerId);
                }

                // Configuration - larger QR box for better scanning
                const config = {
                    fps: 10,
                    qrbox: { width: 280, height: 280 },
                    aspectRatio: 1.0,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                };

                // Start scanning (prefer back camera)
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
                        (errorMessage) => {
                            // ignore frame read errors
                        }
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

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all active:scale-95"
                    aria-label="Close scanner"
                >
                    <X size={24} />
                </button>
            )}

            {/* Camera View - Full Screen */}
            <div id="reader" className="w-full h-full absolute inset-0"></div>

            {/* Scanning Instructions */}
            {hasPermission && !error && (
                <div className="absolute bottom-8 left-0 right-0 z-40 text-center px-4">
                    <p className="text-white text-lg font-medium drop-shadow-lg">
                        Position QR code within the frame
                    </p>
                    <p className="text-white/70 text-sm mt-2 drop-shadow">
                        The code will be scanned automatically
                    </p>
                </div>
            )}

            {/* Placeholder / Loading State */}
            {!hasPermission && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                    <div className="text-white animate-pulse flex flex-col items-center">
                        <Camera size={64} className="mb-4" />
                        <p className="text-lg font-medium">Starting Camera...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-30 p-4">
                    <div className="text-center p-8 max-w-md bg-slate-900/95 backdrop-blur rounded-2xl border border-red-500/50 text-red-400">
                        <AlertCircle size={48} className="mx-auto mb-4" />
                        <p className="text-base font-medium mb-4">{error}</p>
                        {hasPermission === false && (
                            <p className="text-xs text-slate-400 mt-4">
                                If you are on iOS, make sure you are using Safari.
                                Chrome on iOS may have permission issues.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Scanning Frame Overlay */}
            {hasPermission && !error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {/* Dark overlay with cutout effect */}
                    <div className="absolute inset-0 bg-black/60"></div>

                    {/* Scanning Frame */}
                    <div className="relative w-80 h-80">
                        {/* Corner Indicators */}
                        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-cyan-400 rounded-tl-2xl shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse"></div>
                        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-cyan-400 rounded-tr-2xl shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse"></div>
                        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-cyan-400 rounded-bl-2xl shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse"></div>
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-cyan-400 rounded-br-2xl shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse"></div>

                        {/* Scanning Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
