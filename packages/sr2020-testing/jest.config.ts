module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@alice/(.*)$': '<rootDir>/../$1',
  },
  setupFilesAfterEnv: ['./set-jest-timeout.ts'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
};
