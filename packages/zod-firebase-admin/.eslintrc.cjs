module.exports = {
  env: {
    jest: true,
    node: true,
  },
  root: true,

  extends: ['@valian/eslint-config/node'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },

  rules: {
    'import/no-duplicates': ['error', { 'prefer-inline': true }],
  },

  overrides: [
    {
      files: ['__mocks__/*', '__integration-tests__/*'],
      rules: { 'import/no-extraneous-dependencies': ['error', { devDependencies: false }] },
    },
    {
      files: ['rollup.config.js'],
      rules: { 'import/no-extraneous-dependencies': 'off' },
    },
  ],
}
