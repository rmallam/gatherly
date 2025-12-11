import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

const QRGenerator = ({ payload, name, eventTitle, phoneNumber }) => {
    const qrRef = useRef();
    const [sharing, setSharing] = useState(false);

    const handleDownload = async () => {
        try {
            const canvas = qrRef.current.querySelector('canvas');
            if (!canvas) {
                console.error('Canvas not found');
                return;
            }

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            // Try Capacitor Filesystem for Android/iOS
            try {
                const { Capacitor } = await import('@capacitor/core');

                if (Capacitor.isNativePlatform()) {
                    const { Filesystem, Directory } = await import('@capacitor/filesystem');

                    // Convert blob to base64
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    await new Promise(resolve => reader.onloadend = resolve);
                    const base64Data = reader.result.split(',')[1];

                    const fileName = `invite-${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;

                    const result = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: Directory.Documents
                    });

                    alert(`QR code saved to Documents folder as ${fileName}`);
                    return;
                }
            } catch (err) {
                console.log('Not a native platform, using browser download:', err);
            }

            // Fallback to browser download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `invite-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to save QR code');
        }
    };

    const shareQR = async () => {
        setSharing(true);
        try {
            const canvas = qrRef.current.querySelector('canvas');
            if (!canvas) throw new Error('QR code not found');

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            // Try Capacitor Share API for native platforms
            try {
                const { Capacitor } = await import('@capacitor/core');

                if (Capacitor.isNativePlatform()) {
                    const { Share } = await import('@capacitor/share');
                    const { Filesystem, Directory } = await import('@capacitor/filesystem');

                    // Convert blob to base64
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    await new Promise(resolve => reader.onloadend = resolve);
                    const base64Data = reader.result.split(',')[1];

                    // Save to temp file
                    const fileName = `${name}-qr-code.png`;
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: Directory.Cache
                    });

                    // Share the file
                    await Share.share({
                        title: 'Event QR Code',
                        text: `QR Code for ${name} - ${eventTitle}`,
                        url: savedFile.uri,
                        dialogTitle: 'Share QR Code'
                    });

                    setSharing(false);
                    return;
                }
            } catch (err) {
                console.log('Capacitor share not available, trying web API:', err);
            }

            // Fallback to Web Share API
            const file = new File([blob], `${name}-qr-ticket.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Event QR Code' });
            } else if (navigator.share) {
                // If can't share files, try just sharing text
                await navigator.share({ text: 'Event QR Code', title: 'Event QR Code' });
            } else {
                // Final fallback to download
                handleDownload();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                // Fallback to download
                handleDownload();
            }
        } finally {
            setSharing(false);
        }
    };

    return (
        <div ref={qrRef} className="card" style={{ maxWidth: '340px', width: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1.5rem 1.25rem',
                textAlign: 'center'
            }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.375rem'
                }}>
                    {eventTitle}
                </p>
                <h4 style={{
                    color: 'white',
                    fontSize: '1.375rem',
                    fontWeight: '700',
                    margin: '0',
                    lineHeight: '1.2'
                }}>
                    {name}
                </h4>
                {phoneNumber && (
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '0.875rem',
                        marginTop: '0.375rem',
                        fontWeight: '500'
                    }}>
                        {phoneNumber}
                    </p>
                )}
            </div>

            {/* QR Code */}
            <div style={{
                padding: '2rem 1.5rem',
                background: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    padding: '1rem',
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid var(--border)'
                }}>
                    <QRCodeCanvas
                        value={JSON.stringify(payload)}
                        size={180}
                        level="H"
                        includeMargin={true}
                    />
                </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                        onClick={handleDownload}
                        className="btn btn-secondary"
                        style={{
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            justifyContent: 'center'
                        }}
                    >
                        <Download size={16} /> Save
                    </button>
                    <button
                        onClick={shareQR}
                        disabled={sharing}
                        className="btn btn-primary"
                        style={{
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            justifyContent: 'center'
                        }}
                    >
                        {sharing ? 'Sharing...' : (
                            <>
                                <Share2 size={16} /> Share
                            </>
                        )}
                    </button>
                </div>

                {/* Help Text */}
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    textAlign: 'center',
                    marginTop: '1rem',
                    lineHeight: '1.4'
                }}>
                    Scan this code at the event to check in
                </p>
            </div>
        </div>
    );
};

export default QRGenerator;
