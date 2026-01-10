import { RateApp } from 'capacitor-rate-app';
import { Capacitor } from '@capacitor/core';

const RateAppService = {
    /**
     * Check if we should prompt for a review and trigger it if criteria met.
     * @param {string} triggerAction - 'scan', 'create_event', 'export', 'manual_trigger'
     */
    checkAndPrompt: async (triggerAction = 'generic') => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Not native platform, skipping review prompt');
            return;
        }

        try {
            // 1. Check Global criteria (frequency)
            const LAST_PROMPT_KEY = 'hosteze_last_review_prompt';
            const TOTAL_PROMPTS_KEY = 'hosteze_total_prompts';

            const lastPrompt = localStorage.getItem(LAST_PROMPT_KEY);
            const totalPrompts = parseInt(localStorage.getItem(TOTAL_PROMPTS_KEY) || '0');
            const now = Date.now();

            // Minimum days between prompts
            const MIN_DAYS_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days

            if (lastPrompt && (now - parseInt(lastPrompt)) < MIN_DAYS_INTERVAL) {
                console.log('Skipping review prompt: Too soon since last prompt');
                return;
            }

            // 2. Check Action-specific criteria
            let shouldPrompt = false;

            if (triggerAction === 'scan') {
                // Increment succesful scans count
                const SCAN_COUNT_KEY = 'hosteze_scan_count_session';
                const currentScans = parseInt(sessionStorage.getItem(SCAN_COUNT_KEY) || '0') + 1;
                sessionStorage.setItem(SCAN_COUNT_KEY, currentScans.toString());

                // Prompt after 10 successful scans in one session
                if (currentScans === 10 || currentScans === 50) {
                    shouldPrompt = true;
                }
            } else if (triggerAction === 'create_event') {
                // Prompt after creating an event (high engagement)
                shouldPrompt = true;
            } else if (triggerAction === 'manual_trigger') {
                shouldPrompt = true;
            }

            // 3. Trigger Prompt
            if (shouldPrompt) {
                console.log('Triggering In-App Review Prompt');

                await RateApp.requestReview();

                // Update storage
                localStorage.setItem(LAST_PROMPT_KEY, now.toString());
                localStorage.setItem(TOTAL_PROMPTS_KEY, (totalPrompts + 1).toString());
            }

        } catch (error) {
            console.error('Failed to request review:', error);
        }
    }
};

export default RateAppService;
