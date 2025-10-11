// eslint.config.cjs
// Flat config for ESLint v8+/v9 using @typescript-eslint

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const path = require('path');

module.exports = [
  // ignore node_modules and build output
  {
    ignores: ['node_modules/**', 'dist/**'],
  },

  // TypeScript rules
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: path.resolve(__dirname, 'tsconfig.json'),
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // keep project permissive for now but pick a few safer rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': 'off',

      // recommended extra checks
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'consistent-return': 'warn'
    },
  },
];