module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit', '<rootDir>/tests/integration'],
  moduleDirectories: ['node_modules', '<rootDir>/apps/api/node_modules'],
  transform: {
    '^.+\\.tsx?$': ['<rootDir>/apps/api/node_modules/ts-jest', { tsconfig: '<rootDir>/tsconfig.base.json' }],
  },
  moduleNameMapper: {
    '^@solaros/types$': '<rootDir>/packages/types/src',
    '^@solaros/contracts$': '<rootDir>/packages/contracts/src',
    '^@solaros/config$': '<rootDir>/packages/config/src',
    '^@solaros/ui$': '<rootDir>/packages/ui/src',
    '^@solaros/database$': '<rootDir>/database/src',
  },
};
