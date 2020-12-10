module.exports = {
  displayName: 'sr2020-testing',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@alice/(.*)$': '<rootDir>/../$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/sr2020-testing',
  setupFilesAfterEnv: ['./set-jest-timeout.ts'],
};
