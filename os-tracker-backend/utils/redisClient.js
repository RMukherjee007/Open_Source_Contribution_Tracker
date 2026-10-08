const redis = require('redis');

let redisClient;

if (process.env.REDIS_URL) {
    redisClient = redis.createClient({
        url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => console.log('Redis Client Error:', err.message || err));
    redisClient.on('connect', () => console.log('Redis Client Connected'));

    redisClient.connect().catch((err) => {
        console.warn('Redis connection failed; proceeding without Redis cache:', err.message || err);
    });
} else {
    console.log('No REDIS_URL specified. Running without Redis cache.');
    redisClient = {
        isReady: false,
        get: async () => null,
        setEx: async () => {}
    };
}

module.exports = redisClient;

