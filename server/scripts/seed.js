require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');
const { User } = require('../common/db/models');
const { ADMIN } = require('../common/constants/roles');

const SALT_ROUNDS = 10;

async function seed() {
  await mongoose.connect(config.mongoUri);
  const existing = await User.findOne({ role: ADMIN });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    await mongoose.disconnect();
    process.exit(0);
    return;
  }
  const hash = await bcrypt.hash('admin123', SALT_ROUNDS);
  await User.create({
    email: 'admin@crm.local',
    password: hash,
    name: 'Administrator',
    role: ADMIN,
  });
  console.log('Admin created: admin@crm.local / admin123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
