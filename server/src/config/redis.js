import Redis from "ioredis";

let redisClient = null;
let isRedisConnected = false;

if (process.env.REDIS_URI) {
    redisClient = new Redis(process.env.REDIS_URI, {
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn("[Redis] Connection retries exhausted. Disabling cache.");
                return null; // Stop retrying
            }
            return Math.min(times * 100, 3000);
        },
        maxRetriesPerRequest: 1, // Don't block requests forever
    });

    redisClient.on("connect", () => {
        console.log("[Redis] Connected to Upstash/Redis.");
        isRedisConnected = true;
    });

    redisClient.on("error", (err) => {
        console.error("[Redis] Error:", err.message);
        isRedisConnected = false;
    });
} else {
    console.warn("[Redis] REDIS_URI not found. Running in cache-less mode (MongoDB only).");
}

/**
 * Delete keys matching a pattern. Very useful for invalidating cached lists.
 * @param {string} pattern - Redis key pattern (e.g., 'doubts:*')
 */
export const invalidateCache = async (pattern) => {
    if (!redisClient || !isRedisConnected) return;

    try {
        let cursor = "0";
        do {
            const result = await redisClient.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = result[0];
            const keys = result[1];

            if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(`[Redis] Invalidated ${keys.length} keys matching: ${pattern}`);
            }
        } while (cursor !== "0");
    } catch (error) {
        console.error(`[Redis] Invalidation error for pattern ${pattern}:`, error);
    }
};

export { redisClient, isRedisConnected };
