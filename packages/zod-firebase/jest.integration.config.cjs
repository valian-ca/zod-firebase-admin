module.exports = {
  preset: 'ts-jest/presets/js-with-babel-esm',
  clearMocks: true,
  testEnvironment: 'node',
  testRegex: ['/__integration-tests__/.*'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!src/**/*.test.ts'],
}
