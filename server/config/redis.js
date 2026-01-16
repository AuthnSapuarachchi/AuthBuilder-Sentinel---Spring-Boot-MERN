import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// 1. Setup Redis Client
// If you use Docker/Localhost:
const redisClient = new Redis({
    host: 'localhost', // Or your Docker container IP
    port: 6379,
    enableOfflineQueue: false,
});

// If you use Upstash/Cloud, use this instead:
// const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
    console.log('✅ Redis Connected');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

export default redisClient;