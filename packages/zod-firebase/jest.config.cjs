module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/__integration-tests__/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/schema/types/**.ts',
    '!src/collection/index.ts',
    '!src/collection/factory/index.ts',
  ],
  coverageReporters: ['text', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
