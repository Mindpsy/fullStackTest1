const mongoose = require('mongoose');
const config = require('../../config');
const logger = require('../utils/logger');

const connect = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

module.exports = { connect, mongoose };
