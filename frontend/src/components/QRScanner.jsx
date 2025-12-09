import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AlertCircle, Camera } from 'lucide-react';

const QRScanner = ({ onScan, onError }) => {
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

                // Configuration
                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
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
                                // Optional: pause after successful scan to prevent repeated scans
                                // scannerRef.current.pause(); 
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
        <div className="w-full max-w-md mx-auto space-y-4">
            <div className="relative overflow-hidden rounded-xl border-2 border-slate-700 bg-black min-h-[300px] flex items-center justify-center">
                <div id="reader" className="w-full h-full absolute inset-0"></div>

                {/* Placeholder / Loading State */}
                {!hasPermission && !error && (
                    <div className="text-slate-500 animate-pulse flex flex-col items-center">
                        <Camera size={48} className="mb-2" />
                        <p>Starting Camera...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="z-10 text-center p-6 max-w-[80%] bg-slate-900/90 backdrop-blur rounded-xl border border-red-500/30 text-red-400">
                        <AlertCircle size={32} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
            </div>
            {hasPermission === false && (
                <div className="text-xs text-center text-slate-500">
                    If you are on iOS, make sure you are using Safari.
                    If you are using Chrome on iOS, permissions can be tricky.
                </div>
            )}
        </div>
    );
};

export default QRScanner;
