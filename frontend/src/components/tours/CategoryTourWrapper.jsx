import React from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

const CategoryTourWrapper = ({ tabId, steps, run = false, onComplete = null }) => {
    const { seenTabTours, completeTabTour } = useAuth();

    // Run this tour if either triggered manually, or if this specific tab hasn't been toured yet.
    // Ensure we actually have steps to show before deciding to run.
    const hasSeenIt = seenTabTours[tabId];
    const shouldRun = (run || !hasSeenIt) && steps && steps.length > 0;

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            completeTabTour(tabId); // Mark this category as seen
            if (onComplete) onComplete();
        }
    };

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={shouldRun}
            scrollToFirstStep
            showProgress
            showSkipButton
            scrollOffset={150}
            spotlightPadding={8}
            steps={steps}
            styles={{
                options: {
                    arrowColor: '#1f2937',
                    backgroundColor: '#1f2937',
                    overlayColor: 'rgba(0, 0, 0, 0.85)',
                    primaryColor: '#8b5cf6', // HostEze Purple
                    textColor: '#f9fafb',
                    zIndex: 10000,
                },
                tooltipContainer: {
                    textAlign: 'left'
                },
                buttonNext: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                },
                buttonBack: {
                    color: 'var(--text-secondary)'
                },
                buttonSkip: {
                    color: 'var(--text-tertiary)'
                }
            }}
            floaterProps={{
                disableAnimation: true,
            }}
        />
    );
};

export default CategoryTourWrapper;
