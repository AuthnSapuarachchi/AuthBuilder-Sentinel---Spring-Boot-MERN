import { RateLimiterRedis } from 'rate-limiter-flexible';
import redisClient from '../config/redis.js';

// 1. Define Rules: "Login Limiter"
// Allow 5 attempts every 1 minute (60 seconds)
const loginLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail', // Prefix for Redis keys
    points: 5,               // Number of attempts allowed
    duration: 60,            // Per 60 seconds
    blockDuration: 60 * 15,  // Block for 15 minutes if consumed
});

// 2. The Middleware Function
export const loginRateLimiter = async (req, res, next) => {
    try {
        // Use IP address as the key
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // Consume 1 point
        await loginLimiter.consume(ip);
        
        next(); // Allow request to proceed
    } catch (rejRes) {
        // If rejected (limit exceeded)
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Try again in 15 minutes.",
            retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60
        });
    }
};