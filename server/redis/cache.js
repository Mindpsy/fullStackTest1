const { getRedis } = require('./client');

const CLIENTS_CACHE_PREFIX = 'clients:';
const STATS_CACHE_PREFIX = 'stats:';
const CLIENTS_TTL = 300; // 5 min
const STATS_TTL = 180; // 3 min

const buildClientsKey = (userId, page, limit, status, managerId, search) => {
  const s = status || 'all';
  const m = managerId || 'all';
  const q = (search || '').trim() || 'all';
  return `${CLIENTS_CACHE_PREFIX}${userId}:${page}:${limit}:${s}:${m}:${q}`;
};

const get = async (key) => {
  const redis = getRedis();
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const set = async (key, value, ttlSeconds) => {
  const redis = getRedis();
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
};

const del = async (pattern) => {
  const redis = getRedis();
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
};

const getClientsCache = async (userId, page, limit, status, managerId, search) => {
  const key = buildClientsKey(userId, page, limit, status, managerId, search);
  return get(key);
};

const setClientsCache = async (userId, page, limit, status, managerId, search, data) => {
  const key = buildClientsKey(userId, page, limit, status, managerId, search);
  await set(key, data, CLIENTS_TTL);
};

const invalidateClientsCache = async () => {
  await del(`${CLIENTS_CACHE_PREFIX}*`);
};

const getStatsCache = async (userId) => {
  return get(`${STATS_CACHE_PREFIX}${userId}`);
};

const setStatsCache = async (userId, data) => {
  await set(`${STATS_CACHE_PREFIX}${userId}`, data, STATS_TTL);
};

const invalidateStatsCache = async () => {
  await del(`${STATS_CACHE_PREFIX}*`);
};

module.exports = {
  getClientsCache,
  setClientsCache,
  invalidateClientsCache,
  getStatsCache,
  setStatsCache,
  invalidateStatsCache,
};
