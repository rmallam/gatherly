import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div style={{
            borderBottom: '2px solid var(--border)',
            marginBottom: '2rem'
        }}>
            <div style={{
                display: 'flex',
                gap: '0.25rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                padding: '0.5rem'
            }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            title={tab.label}
                            data-testid={`tab-${tab.id}`}
                            aria-label={tab.label}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                padding: '0.75rem 1rem',
                                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                borderRadius: isActive ? '8px 8px 0 0' : '0',
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                marginBottom: '-2px',
                                minWidth: '64px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Icon size={22} />
                                {tab.badge && tab.badge > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-8px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '18px',
                                        height: '18px',
                                        padding: '0 4px',
                                        background: isActive ? 'var(--primary)' : '#ef4444',
                                        color: 'white',
                                        borderRadius: '999px',
                                        fontSize: '0.625rem',
                                        fontWeight: 700
                                    }}>
                                        {tab.badge}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 500 }}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TabNavigation;
