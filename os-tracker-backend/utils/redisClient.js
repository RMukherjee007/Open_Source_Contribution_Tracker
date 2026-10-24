const redis = require('redis');

// In-memory TTL cache fallback when Redis is unavailable
const memoryCache = new Map();
const MAX_MEMORY_ITEMS = 250;

const cleanExpiredMemoryCache = () => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
        if (entry.expiresAt <= now) {
            memoryCache.delete(key);
        }
    }
};

const memoryStore = {
    get: async (key) => {
        const entry = memoryCache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            memoryCache.delete(key);
            return null;
        }
        return entry.value;
    },
    setEx: async (key, ttlSeconds, value) => {
        if (memoryCache.size >= MAX_MEMORY_ITEMS) {
            cleanExpiredMemoryCache();
            if (memoryCache.size >= MAX_MEMORY_ITEMS) {
                const oldestKey = memoryCache.keys().next().value;
                if (oldestKey) memoryCache.delete(oldestKey);
            }
        }
        memoryCache.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    }
};

let rawRedisClient = null;
let redisReady = false;

if (process.env.REDIS_URL) {
    rawRedisClient = redis.createClient({
        url: process.env.REDIS_URL
    });

    rawRedisClient.on('error', (err) => {
        redisReady = false;
        console.log('Redis Client Error:', err.message || err);
    });
    rawRedisClient.on('ready', () => {
        redisReady = true;
        console.log('Redis Client Connected & Ready');
    });
    rawRedisClient.on('end', () => {
        redisReady = false;
    });

    rawRedisClient.connect().catch((err) => {
        redisReady = false;
        console.warn('Redis connection failed; falling back to in-memory TTL cache:', err.message || err);
    });
} else {
    console.log('No REDIS_URL specified. Using high-speed in-memory TTL cache.');
}

const cacheClient = {
    get isReady() {
        return true; // Always ready via Redis or in-memory fallback
    },
    get backendType() {
        return redisReady ? 'redis' : 'memory';
    },
    async get(key) {
        if (redisReady && rawRedisClient) {
            try {
                return await rawRedisClient.get(key);
            } catch (err) {
                console.error('Redis get error, falling back to memory:', err.message);
            }
        }
        return memoryStore.get(key);
    },
    async setEx(key, ttlSeconds, value) {
        if (redisReady && rawRedisClient) {
            try {
                await rawRedisClient.setEx(key, ttlSeconds, value);
                return;
            } catch (err) {
                console.error('Redis setEx error, falling back to memory:', err.message);
            }
        }
        await memoryStore.setEx(key, ttlSeconds, value);
    }
};

module.exports = cacheClient;
