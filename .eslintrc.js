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
    'prefer-rest-params': 0,
    'prefer-object-spread': 0,
    'prefer-default-export': 0,
    'no-underscore-dangle': 0
  }
};
