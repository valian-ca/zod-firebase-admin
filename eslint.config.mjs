import { config } from '@valian/eslint-config'
// eslint-disable-next-line import-x/no-rename-default
import vitest from '@vitest/eslint-plugin'

export default [
  ...config.base,
  ...config.typescript,
  ...config.importSort,
  {
    ignores: ['**/dist/', '**/lib', '**/coverage/'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },

    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
  {
    settings: {
      'import-x/resolver': {
        typescript: {
          project: ['packages/*/tsconfig.json', 'tsconfig.json'],
          noWarnOnMultipleProjects: true,
        },
      },
    },
  },
  {
    files: ['**/*.test.ts'],
    ...vitest.configs.recommended,
  },
]
