import React from 'react';
import { Globe, Sparkles } from 'lucide-react';

import { countries } from '../../utils/currencyUtils';

export const CountrySelector = ({ selectedCountry, onCountryChange, disabled }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bg-secondary)',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Globe size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Location Context:</span>
            </div>

            <select
                value={selectedCountry}
                onChange={(e) => onCountryChange(e.target.value)}
                disabled={disabled}
                style={{
                    flex: 1,
                    background: 'navajowhite', // Keeping distinct background helps visibility
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer'
                }}
                className="country-select"
            >
                {countries.map(country => (
                    <option key={country.code} value={country.code}>
                        {country.name} ({country.currency})
                    </option>
                ))}
            </select>
        </div>
    );
};

export const AIHeader = ({ title, description, badge }) => (
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            color: 'white',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
            <Sparkles size={14} />
            {badge || 'AI Powered'}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '80%', margin: '0 auto' }}>
            {description}
        </p>
    </div>
);
