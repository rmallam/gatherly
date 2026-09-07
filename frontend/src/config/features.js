/**
 * Feature flags.
 *
 * The app has been shrunk to its core loop for a focused market test:
 *   create event → add guests → they RSVP from a link → get a QR → scan at the door.
 *
 * Everything else is gated here (default OFF) rather than deleted, so any
 * feature can be brought back by flipping a single boolean.
 */
export const FEATURES = {
    // Planning sub-tools: catering, tasks, venue, decorations, gifts,
    // entertainment, vendors, budget, reminders.
    PLANNING_TAB: false,
    GALLERY_TAB: false,
    MESSAGES_TAB: false,
    EVENT_WALL: false,
    // "Split expense" / trip events, with the expenses + schedule tabs.
    SHARED_EVENTS: false,
    AI_ASSISTANT: false,
    // In-app notification center (bottom-nav tab).
    NOTIFICATIONS: false,
    // Free-plan event limit + upgrade prompts. Off during the market test so
    // repeat hosts aren't paywalled while we learn whether they come back.
    PRO_UPSELL: false,
    // In-app guided tours (react-joyride). Off: they describe features that
    // are hidden in the core-loop build, and the shrunk app doesn't need them.
    TOURS: false,
};
