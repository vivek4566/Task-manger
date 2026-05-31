export default {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'app.js',
    '!index.js',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 30000,
};
