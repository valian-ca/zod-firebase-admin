import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['__integration-tests__/**/*.test.ts'],
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
