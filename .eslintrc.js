module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb-base', 'prettier'],
  // plugins: ['svelte3'],
  // overrides: [
  //   {
  //     files: ['**/*.svelte'],
  //     processor: 'svelte3/svelte3',
  //   },
  // ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-console': 0,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    'import/prefer-default-export': 'off',
    'prefer-destructuring': 0,
    'no-plusplus': 0,
    'no-await-in-loop': 0,
    'no-restricted-syntax': 0,
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: './webpack.config.js',
      },
    },
  },
};
