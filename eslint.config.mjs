import { config } from '@valian/eslint-config'

export default [
  ...config.base,
  ...config.typescript,
  ...config.importSort,
  ...config.jest,
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
]
