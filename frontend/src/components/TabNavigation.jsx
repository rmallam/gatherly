import React, { useRef, useEffect } from 'react';
import '../pages/EventTabs.css';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
    const scrollRef = useRef(null);
    const activeTabRef = useRef(null);

    // Scroll active tab into view smoothly
    useEffect(() => {
        if (activeTabRef.current && scrollRef.current) {
            const container = scrollRef.current;
            const tab = activeTabRef.current;
            // Simple center logic
            const containerWidth = container.offsetWidth;
            const tabLeft = tab.offsetLeft;
            const tabWidth = tab.offsetWidth;
            const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [activeTab]);

    return (
        <div className="tab-nav-container">
            <div className="tab-nav-scroll" ref={scrollRef}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            ref={isActive ? activeTabRef : null}
                            onClick={() => onTabChange(tab.id)}
                            className={`tab-nav-item ${isActive ? 'active' : ''}`}
                            title={tab.label}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`panel-${tab.id}`}
                            id={`tab-${tab.id}`}
                        >
                            <div style={{ position: 'relative' }}>
                                <Icon size={22} />
                                {tab.badge && tab.badge > 0 && (
                                    <span className="tab-nav-badge count">
                                        {tab.badge > 99 ? '99+' : tab.badge}
                                    </span>
                                )}
                                {tab.hasUpdates && !tab.badge && (
                                    <span className="tab-nav-badge" />
                                )}
                            </div>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TabNavigation;
