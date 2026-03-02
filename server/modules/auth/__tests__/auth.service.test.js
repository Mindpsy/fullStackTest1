const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../../../common/db/models', () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../../../redis/blacklist', () => ({
  addToBlacklist: jest.fn(() => Promise.resolve()),
}));

const authService = require('../auth.service');
const { User } = require('../../../../common/db/models');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user with manager role when email is free', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockImplementation((data) => Promise.resolve({
        toObject() {
          const { password, ...rest } = data;
          return { ...rest, _id: '123', role: 'manager' };
        },
      }));

      const result = await authService.register('test@test.com', 'password123', 'Test User');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(User.create).toHaveBeenCalled();
      expect(result.role).toBe('manager');
      expect(result.email).toBe('test@test.com');
    });

    it('should throw when email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@test.com' });

      await expect(authService.register('test@test.com', 'pass', 'Name'))
        .rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return token and user when credentials are valid', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      User.findOne.mockResolvedValue({
        _id: 'uid',
        email: 'test@test.com',
        password: hashed,
        name: 'Test',
        role: 'manager',
        toObject() {
          return { _id: 'uid', email: 'test@test.com', name: 'Test', role: 'manager' };
        },
      });

      const result = await authService.login('test@test.com', 'password123');

      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw when password is wrong', async () => {
      const hashed = await bcrypt.hash('right', 10);
      User.findOne.mockResolvedValue({ password: hashed });

      await expect(authService.login('test@test.com', 'wrong'))
        .rejects.toThrow('Invalid email or password');
    });
  });
});
