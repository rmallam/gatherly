import React from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

const EventDetailsTour = ({ run, onComplete }) => {
    const { hasSeenEventTour, hasSeenDashboardTour, completeEventTour } = useAuth();

    // Only run if triggered manually OR if they haven't seen it yet
    // CRITICAL: Must wait for DashboardTour to finish first if it hasn't
    const shouldRun = run || (!hasSeenEventTour && hasSeenDashboardTour);

    const steps = [
        {
            content: (
                <div>
                    <h3>Your Event Workspace 🎪</h3>
                    <p>Welcome to your first event! Let's see what you can do here.</p>
                </div>
            ),
            placement: 'center',
            target: 'body',
            disableScrolling: true,
        },
        {
            target: '.tour-overview-tab',
            content: 'The Overview tab holds all widgets, links, and high-level details.',
            placement: 'bottom',
        },
        {
            target: '.tour-tasks-tab',
            content: 'Free users can organize their event manually by adding Custom Tasks and Menu Items in these tabs.',
            placement: 'bottom',
        },
        {
            target: '.tour-ai-generator',
            content: '✨ Pro users unlock Gemini AI! Automatically generate complete itineraries, catering menus, and split-expense logic with one click.',
            placement: 'top',
        },
        {
            target: '.tour-invite-btn',
            content: 'Finally, share this link with your guests so they can RSVP or pay you back!',
            placement: 'bottom',
        }
    ];

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            completeEventTour(); // Save to local storage
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
        />
    );
};

export default EventDetailsTour;
