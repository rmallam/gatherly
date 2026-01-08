/**
 * Optimistic UI Update Utilities
 * Provides helpers for instant UI updates before API confirmation
 */

/**
 * Execute an optimistic update with automatic rollback on error
 * @param {Function} optimisticUpdate - Function to update UI immediately
 * @param {Function} apiCall - Async function that makes the API call
 * @param {Function} onSuccess - Function to update UI with real data
 * @param {Function} onError - Function to rollback on error
 */
export const withOptimisticUpdate = async ({
    optimisticUpdate,
    apiCall,
    onSuccess,
    onError
}) => {
    // Apply optimistic update immediately
    optimisticUpdate();

    try {
        // Make actual API call
        const result = await apiCall();

        // Update with real data
        if (onSuccess) {
            onSuccess(result);
        }

        return { success: true, data: result };
    } catch (error) {
        // Rollback on error
        if (onError) {
            onError(error);
        }

        return { success: false, error };
    }
};

/**
 * Generate a temporary ID for optimistic items
 */
export const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Check if an item is temporary (not yet confirmed by server)
 */
export const isTempItem = (id) => String(id).startsWith('temp-');

/**
 * Debounce function to limit API call frequency
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Simple in-memory cache with TTL
 */
class SimpleCache {
    constructor() {
        this.cache = new Map();
    }

    set(key, value, ttl = 60000) { // Default 1 minute TTL
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

export const cache = new SimpleCache();
