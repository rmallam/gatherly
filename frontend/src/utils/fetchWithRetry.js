// Fetch with retry and timeout for handling backend cold starts
export const fetchWithRetry = async (url, options = {}, retries = 3, timeout = 30000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            const isLastAttempt = i === retries - 1;

            if (isLastAttempt) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, i) * 1000;
            console.log(`Fetch failed (attempt ${i + 1}/${retries}), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};
