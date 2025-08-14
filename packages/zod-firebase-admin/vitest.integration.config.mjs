import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['__integration-tests__/**/*.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 20_000,
    poolOptions: {
      threads: {
        singleThread: true,
        minThreads: 1,
        maxThreads: 1,
      },
    },
    fileParallelism: false,
    sequence: { concurrent: false },
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      all: true,
      include: ['src/**/*.ts', '!src/index.ts', '!src/**/*.test.ts'],
    },
    deps: { interopDefault: true },
  },
})
