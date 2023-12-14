module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:svelte/recommended'],
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['*.cjs', '*.mjs'],
  overrides: [{
    files: ['*.svelte'], parser: 'svelte-eslint-parser', parserOptions: {
      parser: '@typescript-eslint/parser',
    },
  }],
  settings: {
    svelte: {
      ignoreWarnings: [
        'svelte/valid-compile',
        'svelte/no-at-html-tags',
      ],
    },
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-dynamic-require': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-prototype-builtins': 'off',
    'prefer-const': 'off',
    'no-extra-boolean-cast': 'off',
    'no-console': 0,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    'import/prefer-default-export': 'off',
    'prefer-destructuring': 0,
    'no-plusplus': 0,
    'no-await-in-loop': 0,
    'no-restricted-syntax': 0,
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    allowImportExportEverywhere: true,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};
