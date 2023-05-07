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
  ignorePatterns: ['vite.config.ts', '**/node_modules', 'src/abi/*'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json'
  },
  plugins: ['react', 'simple-import-sort', 'unused-imports'],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-duplicates': 'warn',
    'unused-imports/no-unused-imports': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'multiline-ternary': 'off',
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreStrings: true,
        ignorePattern: '^\\s*var\\s.+=\\s*require\\s*\\(',
        ignoreUrls: true
      }
    ],
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
    'no-void': 'off',
    '@typescript-eslint/return-await': ['warn', 'in-try-catch'],
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    'react/jsx-tag-spacing': 'warn',
    'indent': ['warn', 2]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
