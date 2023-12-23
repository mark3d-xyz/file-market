module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript',
    'plugin:storybook/recommended'
  ],
  ignorePatterns: ['vite.config.ts', 'vite.prod.config.ts', '**/node_modules', 'src/abi/*'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json'
  },
  plugins: ['react', 'simple-import-sort', 'unused-imports'],
  rules: {
    // imports
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-duplicates': 'warn',
    'unused-imports/no-unused-imports': 'error',

    // typescript
    "@typescript-eslint/no-parameter-properties": "off",
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/return-await': ['warn', 'in-try-catch'],
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/indent': ['warn', 2],
    '@typescript-eslint/comma-dangle': ['warn', 'always-multiline'],

    // react
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/jsx-tag-spacing': 'warn',
    'react/jsx-max-props-per-line': ['warn', {
      maximum: { 
        single: 3,
        multi: 1
      }
    }],
    'react/jsx-first-prop-new-line': ['warn', 'multiline-multiprop'],
    // 'react/jsx-sort-props': ['warn', {
    //   callbacksLast: true,
    //   shorthandFirst: true,
    //   multiline: 'last',
    //   reservedFirst: true,
    //   noSortAlphabetically: true
    // }],
    'react/jsx-indent': ['warn', 2, {
      indentLogicalExpressions: true
    }],
    'react/jsx-indent-props': ['warn', 2, ],
    'react/jsx-closing-tag-location': 'warn',
    'react/jsx-wrap-multilines': ['warn', {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'parens-new-line'
    }],
    'react/jsx-one-expression-per-line': ['warn', {
      allow: 'single-child'
    }],
    'react/jsx-closing-bracket-location': 'warn',
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/jsx-no-useless-fragment': ['warn', {
      allowExpressions: true
    }],
    "react/self-closing-comp": ["warn", {
      "component": true,
      "html": true
    }],

    // other
    'no-use-before-define': 'off',
    'multiline-ternary': 'off',
    'max-len': ['warn', {
      code: 120,
      ignoreStrings: true,
      ignorePattern: '^\\s*var\\s.+=\\s*require\\s*\\(',
      ignoreUrls: true
    }],
    'no-void': 'off',
    'newline-before-return': 'warn',
    'no-extra-boolean-cast': 'off',
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
