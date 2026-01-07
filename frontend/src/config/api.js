/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints
 */

// Base API URL - uses environment variable or defaults to production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gatherly-backend-3vmv.onrender.com/api';

// Legacy base URL (without /api suffix) for components that need it
export const API_BASE_URL_LEGACY = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://gatherly-backend-3vmv.onrender.com';

// Export default for convenience
export default API_BASE_URL;
