const jwt = require('jsonwebtoken');
const config = require('../config');
const { isTokenBlacklisted } = require('../redis/blacklist');
const { setSocketIo } = require('../redis/queue');
const logger = require('../common/utils/logger');

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: { origin: config.frontendUrl },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const blacklisted = await isTokenBlacklisted(token);
      if (blacklisted) return next(new Error('Token revoked'));
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join('all');
    logger.info(`Socket connected: ${socket.userId}`);
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });

  setSocketIo(io);
  return io;
}

function emitToAll(io, event, payload) {
  if (io) io.to('all').emit(event, payload);
}

module.exports = { initSocket, emitToAll };
