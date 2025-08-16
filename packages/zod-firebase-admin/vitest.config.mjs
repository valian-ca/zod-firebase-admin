import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    clearMocks: true,
    reporters: ['dot', 'junit'],
    outputFile: {
      junit: 'test-results/test-results.xml',
    },
    exclude: ['__integration-tests__/**', '**/node_modules/**', '**/lib/**'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      all: true,
      include: ['src/**/*.ts', '!src/**/index.ts', '!src/schema/types/**.ts'],
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    deps: {
      interopDefault: true,
    },
  },
})
