import { useEffect, useRef } from 'react';

const handlers = [];

export const handleAppBackButton = () => {
    if (handlers.length > 0) {
        // Get the most recently registered handler (top of the stack)
        const topHandler = handlers[handlers.length - 1];
        topHandler.current();
        return true; // Handled
    }
    return false; // Not handled
};

export const useBackButton = (handler, isActive = true) => {
    const handlerRef = useRef(handler);

    // Update the ref when the handler changes, without re-running the effect
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!isActive) return;

        // Only push hash if we don't already have a #modal hash
        if (window.location.hash !== '#modal') {
            window.history.pushState({ modalOpen: true }, '', window.location.pathname + window.location.search + '#modal');
        }

        const handlePopState = () => {
            // This fires when the user swipes back or presses browser back
            handlerRef.current();
        };

        window.addEventListener('popstate', handlePopState);
        handlers.push(handlerRef);

        return () => {
            const index = handlers.lastIndexOf(handlerRef);
            if (index > -1) {
                handlers.splice(index, 1);
            }
            window.removeEventListener('popstate', handlePopState);
            
            // If this was the last active modal closed programmatically,
            // clean up the history stack.
            if (window.location.hash === '#modal') {
                setTimeout(() => {
                    if (handlers.length === 0 && window.location.hash === '#modal') {
                        window.history.back();
                    }
                }, 0);
            }
        };
    }, [isActive]); // Only re-run if isActive changes
};
