import React, { useState } from 'react';
import { X, Upload, Users, AlertCircle } from 'lucide-react';

const BulkImport = ({ onImport, onClose }) => {
    const [text, setText] = useState('');
    const [preview, setPreview] = useState([]);

    const parseContacts = (input) => {
        const lines = input.trim().split('\n');
        const contacts = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // Try to parse: "Name, Phone" or "Name - Phone" or "Name Phone"
            let match = line.match(/^(.+?)[,\-]\s*(.+)$/);
            if (match) {
                contacts.push({ name: match[1].trim(), phone: match[2].trim() });
            } else {
                // Just name, no phone
                contacts.push({ name: line, phone: '' });
            }
        }

        return contacts;
    };

    const handleTextChange = (e) => {
        const value = e.target.value;
        setText(value);
        setPreview(parseContacts(value));
    };

    const handleImport = () => {
        if (preview.length > 0) {
            onImport(preview);
            onClose();
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
            <div className="card" style={{ maxWidth: '40rem', width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={24} style={{ color: 'var(--primary)' }} />
                        Bulk Add Guests
                    </h2>
                    <button onClick={onClose} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Instructions */}
                <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#3730a3', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Paste your guest list below. Formats supported:
                    </p>
                    <ul style={{ fontSize: '0.875rem', color: '#4338ca', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                        <li>John Doe, +1 555-0100</li>
                        <li>Jane Smith - 555-0101</li>
                        <li>Bob Johnson (name only)</li>
                    </ul>
                </div>

                {/* Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Paste Contact List
                    </label>
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        className="input"
                        rows={8}
                        placeholder="John Doe, +1 555-0100&#10;Jane Smith, 555-0101&#10;Bob Johnson"
                        style={{ fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
                    />
                </div>

                {/* Preview */}
                {preview.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Users size={16} style={{ color: 'var(--success)' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
                                {preview.length} guest{preview.length !== 1 ? 's' : ''} ready to import
                            </span>
                        </div>
                        <div style={{ maxHeight: '12rem', overflow: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                            {preview.map((contact, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', fontSize: '0.875rem', borderBottom: i < preview.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{contact.name}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{contact.phone || 'No phone'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        className="btn btn-primary"
                        disabled={preview.length === 0}
                        style={{ opacity: preview.length === 0 ? 0.5 : 1 }}
                    >
                        <Upload size={16} /> Add {preview.length} Guest{preview.length !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImport;
