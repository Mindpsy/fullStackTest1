const bcrypt = require('bcrypt');
const { User } = require('../../common/db/models');
const { ROLES } = require('../../common/constants/roles');

const SALT_ROUNDS = 10;

const list = async (query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);
  return { data: users, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const create = async (data) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await User.create({
    email: data.email.toLowerCase(),
    password: hashed,
    name: data.name,
    role: ROLES.includes(data.role) ? data.role : 'manager',
  });
  return user.toObject();
};

const update = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  if (data.name) user.name = data.name;
  if (data.email) {
    const existing = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } });
    if (existing) {
      const err = new Error('Email already in use');
      err.statusCode = 400;
      throw err;
    }
    user.email = data.email.toLowerCase();
  }
  if (data.role && ROLES.includes(data.role)) user.role = data.role;
  if (data.password) user.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  await user.save();
  const out = user.toObject();
  delete out.password;
  return out;
};

const remove = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
};

module.exports = { list, getById, create, update, remove };
