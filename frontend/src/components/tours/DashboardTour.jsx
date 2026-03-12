import React from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

const DashboardTour = ({ run, onComplete }) => {
    const { hasSeenDashboardTour, completeDashboardTour } = useAuth();

    // Only run if triggered manually OR if they haven't seen it yet
    const shouldRun = run || !hasSeenDashboardTour;

    const steps = [
        {
            content: (
                <div>
                    <h3>Welcome to HostEze! 🎉</h3>
                    <p>Let's take a quick 30-second tour to show you around your new command center.</p>
                </div>
            ),
            placement: 'center',
            target: 'body',
            disableScrolling: true,
        },
        {
            target: '.tour-create-btn',
            content: 'Start here! Click this to create parties, weddings, or split-expense trips.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '.tour-upcoming-tab',
            content: 'Your active and upcoming events will all be tracked right here.',
            placement: 'bottom',
        },
        {
            target: '.tour-profile-nav',
            content: 'Manage your profile, settings, and Pro subscription from this menu.',
            placement: 'left',
        }
    ];

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setTimeout(() => {
                completeDashboardTour(); // Save to local storage
                if (onComplete) onComplete();
            }, 100); // Tiny delay to prevent react state batching crash with EventDetailsTour
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
        />
    );
};

export default DashboardTour;
