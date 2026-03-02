const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const { User } = require('../../common/db/models');
const { addToBlacklist } = require('../../redis/blacklist');
const { MANAGER } = require('../../common/constants/roles');

const SALT_ROUNDS = 10;

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

const register = async (email, password, name) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }
  const hashed = await hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashed,
    name,
    role: MANAGER,
  });
  return userToResponse(user);
};

const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await comparePassword(password, user.password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const token = jwt.sign(
    { userId: user._id.toString() },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return { token, user: userToResponse(user) };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return userToResponse(user);
};

const updateProfile = async (userId, data) => {
  const { name, email, password } = data;
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  if (name) user.name = name;
  if (email) {
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (existing) {
      const err = new Error('Email already in use');
      err.statusCode = 400;
      throw err;
    }
    user.email = email.toLowerCase();
  }
  if (password) user.password = await hashPassword(password);
  await user.save();
  return userToResponse(user);
};

const updateAvatar = async (userId, path) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: path },
    { new: true }
  ).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return userToResponse(user);
};

const logout = async (token) => {
  await addToBlacklist(token);
};

function userToResponse(user) {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  return u;
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar,
  logout,
};
