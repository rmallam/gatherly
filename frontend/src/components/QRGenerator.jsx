import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2, Send, Link as LinkIcon, Check } from 'lucide-react';

const QRGenerator = ({ payload, name, eventTitle, phoneNumber }) => {
    const qrRef = useRef();
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleDownload = () => {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `invite-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = url;
            link.click();
        }
    };

    const handleCopyRSVPLink = async () => {
        const rsvpLink = `${window.location.origin}/rsvp/${payload.eventId}/${payload.guestId}`;

        try {
            await navigator.clipboard.writeText(rsvpLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = rsvpLink;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                alert(`Copy this RSVP link: ${rsvpLink}`);
            }
            document.body.removeChild(textArea);
        }
    };

    const shareQROnly = async () => {
        setSharing(true);
        try {
            const canvas = qrRef.current.querySelector('canvas');
            if (!canvas) throw new Error('QR code not found');

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `${name}-qr-ticket.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
            } else {
                handleDownload();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                handleDownload();
            }
        } finally {
            setSharing(false);
        }
    };

    const shareWithMessage = async () => {
        setSharing(true);
        try {
            const canvas = qrRef.current.querySelector('canvas');
            if (!canvas) throw new Error('QR code not found');

            const rsvpLink = `${window.location.origin}/rsvp/${payload.eventId}/${payload.guestId}`;

            const invitationMessage = `🎉 You're invited to ${eventTitle}!

👤 Guest: ${name}

📋 Please RSVP here:
${rsvpLink}

🎫 Your QR code ticket is attached below. Save it and show it at the door to check in!`;

            // Copy message to clipboard
            try {
                await navigator.clipboard.writeText(invitationMessage);
                const notification = document.createElement('div');
                notification.textContent = '✓ Message copied! Paste it when sharing...';
                notification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:8px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 4px 6px rgba(0,0,0,0.1)';
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 2500);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.log('Clipboard not available');
            }

            // Share QR code
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `${name}-qr-ticket.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
            } else if (navigator.share) {
                await navigator.share({ text: invitationMessage });
                handleDownload();
            } else {
                if (phoneNumber) {
                    const message = encodeURIComponent(invitationMessage);
                    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
                    setTimeout(() => handleDownload(), 500);
                } else {
                    handleDownload();
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                handleDownload();
            }
        } finally {
            setSharing(false);
        }
    };

    return (
        <div ref={qrRef} className="bg-white rounded-2xl inline-block shadow-xl overflow-hidden" style={{ maxWidth: '420px', width: '100%' }}>
            {/* Header */}
            <div style={{
                background: '#4f46e5',
                padding: '2rem 1.5rem',
                textAlign: 'center'
            }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem'
                }}>
                    {eventTitle}
                </p>
                <h4 style={{
                    color: 'white',
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    margin: '0',
                    lineHeight: '1.2'
                }}>
                    {name}
                </h4>
                {phoneNumber && (
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.95rem',
                        marginTop: '0.5rem',
                        fontWeight: '500'
                    }}>
                        {phoneNumber}
                    </p>
                )}
            </div>

            {/* QR Code */}
            <div style={{
                padding: '2.5rem 2rem',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    padding: '1.25rem',
                    background: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <QRCodeCanvas
                        value={JSON.stringify(payload)}
                        size={260}
                        level="H"
                        includeMargin={true}
                    />
                </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '1.5rem', background: 'white' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Primary Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: '0.875rem 1rem',
                                background: '#1e293b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#334155'}
                            onMouseOut={e => e.currentTarget.style.background = '#1e293b'}
                        >
                            <Download size={18} /> Download
                        </button>
                        <button
                            onClick={shareQROnly}
                            disabled={sharing}
                            style={{
                                padding: '0.875rem 1rem',
                                background: sharing ? '#94a3b8' : '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: sharing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => !sharing && (e.currentTarget.style.background = '#4f46e5')}
                            onMouseOut={e => !sharing && (e.currentTarget.style.background = '#6366f1')}
                        >
                            {sharing ? (
                                'Sharing...'
                            ) : (
                                <>
                                    <Send size={18} /> Share QR
                                </>
                            )}
                        </button>
                    </div>

                    {/* Share with Message */}
                    <button
                        onClick={shareWithMessage}
                        disabled={sharing}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            background: sharing ? '#94a3b8' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: sharing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => !sharing && (e.currentTarget.style.background = '#059669')}
                        onMouseOut={e => !sharing && (e.currentTarget.style.background = '#10b981')}
                    >
                        {sharing ? (
                            'Sharing...'
                        ) : (
                            <>
                                <Share2 size={18} /> Share with RSVP Link
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div style={{
                        height: '1px',
                        background: '#e2e8f0',
                        margin: '0.5rem 0'
                    }}></div>

                    {/* Copy Link */}
                    <button
                        onClick={handleCopyRSVPLink}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            background: copied ? '#d1fae5' : 'white',
                            color: copied ? '#065f46' : '#475569',
                            border: '2px solid #e2e8f0',
                            borderRadius: '0.75rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => !copied && (e.currentTarget.style.borderColor = '#cbd5e1')}
                        onMouseOut={e => !copied && (e.currentTarget.style.borderColor = '#e2e8f0')}
                    >
                        {copied ? (
                            <>
                                <Check size={18} /> Link Copied!
                            </>
                        ) : (
                            <>
                                <LinkIcon size={18} /> Copy RSVP Link
                            </>
                        )}
                    </button>
                </div>

                {/* Help Text */}
                <p style={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    textAlign: 'center',
                    marginTop: '1.25rem',
                    lineHeight: '1.5',
                    fontWeight: '500'
                }}>
                    Save or share this QR code. Guests scan it to check in at the event.
                </p>
            </div>
        </div>
    );
};

export default QRGenerator;
