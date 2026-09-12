import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/testing'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'no-var': 'error',
      'no-nested-ternary': 'error',

      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Provider files can export contexts and hooks alongside components
  {
    files: ['**/providers/**/*.{ts,tsx}', '**/context/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // UI component files often export variants
  {
    files: ['**/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Layer boundaries: components/lib are the shared base tier; features sit above
  // them and reach providers through the @/hooks shims.
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features', '@/features/*', '@/features/**', '**/features', '**/features/**'],
              message: 'Shared components and lib must not depend on features.',
            },
            {
              group: ['@/app', '@/app/*', '@/app/**', '**/app', '**/app/**'],
              message: 'Shared components and lib must not depend on the app layer; use @/hooks shims for providers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '@/app/*', '@/app/**', '**/app', '**/app/**'],
              message: 'Features must not import the app layer; import providers through their @/hooks shims.',
            },
          ],
        },
      ],
    },
  },
)
