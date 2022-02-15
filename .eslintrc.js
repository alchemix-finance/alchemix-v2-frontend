module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['plugin:import/recommended', 'airbnb-typescript/base', 'prettier'],
  plugins: ['svelte3', '@typescript-eslint'],
  ignorePatterns: ['*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  settings: {
    // eslint-disable-next-line global-require
    'svelte3/typescript': () => require('typescript'),
    'svelte3/ignore-warnings': ({ code }) => code === 'unused-export-let',
    'import/resolver': {
      webpack: {
        config: './webpack.config.ts',
      },
    },
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
    sourceType: 'module',
    ecmaVersion: 2020,
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
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};
