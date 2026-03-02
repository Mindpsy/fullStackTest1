const Redis = require('ioredis');
const config = require('../config');
const logger = require('../common/utils/logger');

let redisClient = null;

const getRedis = () => {
  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 100, 3000);
      },
    });
    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('connect', () => logger.info('Redis connected'));
  }
  return redisClient;
};

module.exports = { getRedis };
