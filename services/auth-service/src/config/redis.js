const redis = require('redis');

let redisClient;

async function connectRedis() {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD
    });

    redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
    redisClient.on('connect', () => console.log('✅ Redis conectado'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Error conectando a Redis:', error);
    throw error;
  }
}

function getRedisClient() {
  return redisClient;
}

module.exports = { connectRedis, getRedisClient };