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
}
