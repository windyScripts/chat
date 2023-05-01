module.exports = {
    extends: [
      'plugin:import/recommended',
      'eslint:recommended',
    ],
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    ignorePatterns: ['.eslintrc.js'],
    root: true,
    env: {
      node: true,
    },
    globals: {
      document: 'readonly',
      Promise: 'readonly',
      axios: 'readonly',
      window: 'readonly',
      localStorage: 'readonly',
      alert: 'readonly',
      confirm: 'readonly'
    },
    rules: {
      // Basic rules
      indent: ['error', 2, {
        SwitchCase: 1,
        flatTernaryExpressions: false,
      }],
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      semi: 'error',
  
      // Quote rules
      quotes: ['error', 'single'],
      'quote-props': ['error', 'as-needed'],
  
      // Comma rules
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': 'error',
      'comma-style': ['error', 'last'],
  
      // End of file/trailing space rules
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'no-trailing-spaces': 'error',
  
      // Keyword/operator spacing rules
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
  
      // Brace/parenthesis spacing rules
      'array-bracket-spacing': ['error', 'never'],
      'array-bracket-newline': ['error', 'consistent'],
      'arrow-parens': ['error', 'as-needed'],
      'arrow-spacing': 'error',
      'brace-style': 'error',
      'key-spacing': 'error',
      'object-curly-newline': ['error', { consistent: true }],
      'object-curly-spacing': ['error', 'always', { objectsInObjects: false }],
      'object-shorthand': ['error', 'always', { avoidQuotes: true }],
      'padded-blocks': ['error', 'never'],
      'space-before-blocks': 'error',
      'space-in-parens': ['error', 'never'],
  
      // Newline padding rules
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'export' },
        { blankLine: 'any', prev: 'export', next: 'export' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
  
      // Import/export rules
      'import/exports-last': 'error',
      'import/newline-after-import': 'error',
      'import/order': ['error', {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
    },
  };
  