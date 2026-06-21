import { redisClient, isRedisConnected } from "../config/redis.js";

/**
 * Cache middleware generator.
 * @param {string} prefix - The key prefix, e.g., 'doubts', 'mentors'
 * @param {number} ttl - Time to live in seconds (default 60)
 */
export const cacheRoute = (prefix, ttl = 60) => {
    return async (req, res, next) => {
        // Fallback: If Redis is missing/disconnected, proceed normally (MongoDB only)
        if (!redisClient || !isRedisConnected) {
            return next();
        }

        // Generate a unique key based on URL path and query parameters
        // E.g., /api/doubts?page=1&sort=newest -> doubts:/api/doubts?page=1&sort=newest
        // We append the userId for user-specific endpoints to avoid cross-user leaking.
        // For public feeds, we just use the url.
        let cacheKey = `${prefix}:${req.originalUrl}`;
        
        // If it's a notification, make sure the user ID is in the key
        if (prefix === 'notifications') {
            cacheKey = `${prefix}:${req.user._id}:${req.originalUrl}`;
        }

        try {
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                console.log(`[Cache HIT] ${cacheKey}`);
                return res.json(JSON.parse(cachedData));
            }

            console.log(`[Cache MISS] ${cacheKey}`);

            // Intercept res.json to capture the response before it's sent
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
                    redisClient.set(cacheKey, JSON.stringify(body), "EX", ttl).catch(err => {
                        console.error("[Redis] Cache Set Error:", err);
                    });
                }
                
                return originalJson(body);
            };

            next();
        } catch (error) {
            console.error(`[Redis] Cache Middleware Error on ${cacheKey}:`, error);
            // On error, degrade gracefully
            next();
        }
    };
};
