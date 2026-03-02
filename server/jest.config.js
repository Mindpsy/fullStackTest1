module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['modules/**/*.service.js', '!node_modules'],
  forceExit: true,
  testTimeout: 10000,
};
