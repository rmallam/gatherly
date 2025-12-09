import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div style={{
            borderBottom: '2px solid var(--border)',
            marginBottom: '2rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
        }}>
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                minWidth: 'fit-content',
                padding: '0 0.5rem'
            }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 1.5rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: '0.9375rem',
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                position: 'relative',
                                marginBottom: '-2px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                    e.currentTarget.style.borderBottomColor = 'var(--border-light)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.borderBottomColor = 'transparent';
                                }
                            }}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '1.25rem',
                                    height: '1.25rem',
                                    padding: '0 0.375rem',
                                    background: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    borderRadius: '999px',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600
                                }}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TabNavigation;
