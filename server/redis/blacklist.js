const jwt = require('jsonwebtoken');
const { getRedis } = require('./client');
const config = require('../config');

const BLACKLIST_PREFIX = 'blacklist:';

const getBlacklistKey = (token) => `${BLACKLIST_PREFIX}${token}`;

const addToBlacklist = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return;
    const ttl = Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1);
    const redis = getRedis();
    await redis.setex(getBlacklistKey(token), ttl, '1');
  } catch (err) {
    // ignore
  }
};

const isTokenBlacklisted = async (token) => {
  const redis = getRedis();
  const val = await redis.get(getBlacklistKey(token));
  return val === '1';
};

module.exports = { addToBlacklist, isTokenBlacklisted };
