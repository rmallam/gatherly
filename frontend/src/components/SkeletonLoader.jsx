import React from 'react';
import './SkeletonLoader.css';

/**
 * Skeleton Loader Component
 * Shows placeholder content while data is loading
 */

export const SkeletonCard = ({ height = '100px' }) => (
    <div className="skeleton-card" style={{ height }}>
        <div className="skeleton-shimmer"></div>
    </div>
);

export const SkeletonText = ({ width = '100%', height = '16px' }) => (
    <div className="skeleton-text" style={{ width, height }}>
        <div className="skeleton-shimmer"></div>
    </div>
);

export const SkeletonCircle = ({ size = '40px' }) => (
    <div className="skeleton-circle" style={{ width: size, height: size }}>
        <div className="skeleton-shimmer"></div>
    </div>
);

export const SkeletonList = ({ count = 3, height = '80px' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} height={height} />
        ))}
    </div>
);

export const SkeletonEventCard = () => (
    <div className="skeleton-event-card">
        <div className="skeleton-event-header">
            <SkeletonCircle size="48px" />
            <div style={{ flex: 1 }}>
                <SkeletonText width="60%" height="20px" />
                <SkeletonText width="40%" height="14px" style={{ marginTop: '8px' }} />
            </div>
        </div>
        <div className="skeleton-event-body">
            <SkeletonText width="80%" />
            <SkeletonText width="60%" />
        </div>
    </div>
);

export default {
    Card: SkeletonCard,
    Text: SkeletonText,
    Circle: SkeletonCircle,
    List: SkeletonList,
    EventCard: SkeletonEventCard
};
