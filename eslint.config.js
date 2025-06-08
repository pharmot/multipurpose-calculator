import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from 'eslint/config';
export default defineConfig([
  js.configs.recommended,
  {
    'name': 'multipurpose-calculator-eslint-config',
    'files': ['**/*.js'],
    'languageOptions': {
      // 'ecmaVersion': 6,
      'sourceType': 'module',
      'globals': {
        '$': 'readonly',
        'require': 'readonly',
        ...globals.browser,
      },
    },
    'ignores': ['dist/*', 'node_modules/*', 'docs/*'],
    'rules': {
      // Possible Problems
      'for-direction': 'off',
      'no-cond-assign': ['error', 'always'],
      'no-prototype-builtins': 'off',
      'no-unused-vars': 'warn',

      // Suggestions
      'block-scoped-var': 'error',
      'curly': ['error', 'multi-line'],
      'default-case': 'error',
      'default-case-last': 'error',
      'default-param-last': 'error',
      'dot-notation': 'error',
      'eqeqeq': ['error', 'smart'],
      'new-cap': 'error',
      'no-empty': 'warn',
      'no-var': 'error',
      'one-var-declaration-per-line': 'error',
      'prefer-const': [
        'error',
        {
          'destructuring': 'any',
          'ignoreReadBeforeAssign': false,
        },
      ],
      'prefer-template': 'warn',

      // Layout & Formatting
      'array-bracket-newline': ['warn', 'consistent'],
      'array-bracket-spacing':  ['warn', 'never'],
      'arrow-spacing': 'warn',
      'comma-dangle': [
        'warn',
        {
          'arrays': 'always-multiline',
          'objects': 'always-multiline',
          'imports': 'always-multiline',
          'exports': 'always-multiline',
          'functions': 'only-multiline',
        },
      ],
      'comma-spacing': [
        'warn',
        {
          'before': false,
          'after': true,
        },
      ],
      'indent': ['warn', 2],
      'key-spacing': [
        'warn',
        { 'mode': 'minimum' },
      ],
      'keyword-spacing': 'warn',
      'linebreak-style': ['error', 'windows'],
      'no-extra-parens': 'warn',
      'no-multiple-empty-lines': [
        'warn',
        {
          'max': 2,
          'maxBOF': 0,
          'maxEOF': 1,
        },
      ],
      'no-trailing-spaces': [
        'warn',
        {
          'ignoreComments': true,
          'skipBlankLines': true,
        },
      ],
      'object-curly-spacing': [
        'warn',
        'always',
        { 'arraysInObjects': true },
      ],
      'quotes': [
        'warn',
        'single',
        {
          'allowTemplateLiterals': true,
          'avoidEscape': true,
        },
      ],
      'semi': [
        'error',
        'always',
        { 'omitLastInOneLineBlock': true },
      ],
      'semi-spacing': 'warn',
      'space-before-blocks': 'warn',
      'space-before-function-paren': ['error', 'never'],
      // 'space-in-parens': [
      //   'warn',
      //   'always',
      //   {
      //     'exceptions': [
      //       '{}',
      //       '[]',
      //     ],
      //   },
      // ],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
    },
  },
]);
