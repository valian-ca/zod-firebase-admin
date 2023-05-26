const ERROR = 2;
const ALWAYS = 'always';

module.exports = {
  extends: ['@commitlint/config-conventional'],
  defaultIgnores: true,
  parserPreset: {
    parserOpts: {
      noteKeywords: ['See', 'Signed-off-by', 'Co-authored-by'],
    },
  },
  rules: {
    'footer-leading-blank': [ERROR, ALWAYS],
    'footer-max-line-length': [ERROR, ALWAYS, Infinity],
  }
};
