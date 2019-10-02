module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: ['airbnb-base', 'eslint:recommended', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'prefer-rest-params': false,
    'prefer-object-spread': false,
    'prefer-default-export': false
  }
};
