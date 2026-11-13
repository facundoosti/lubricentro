import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

const RELATIVE_IMPORTS = {
  group: ['../*', './*'],
  message: 'Usa alias de importación (@ui, @services, @components, etc.) en lugar de rutas relativas. Ver frontend/CLAUDE.md.',
}

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]', ignoreRestSiblings: true }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [RELATIVE_IMPORTS],
        },
      ],
    },
  },
  {
    // Las features usan los wrappers de @ui (Dialog, ConfirmDialog, Combobox, Select), nunca las primitivas de shadcn
    files: ['src/components/features/**/*.{js,jsx}', 'src/pages/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            RELATIVE_IMPORTS,
            {
              group: ['@/components/ui/primitives', '@/components/ui/primitives/*', '@ui/primitives', '@ui/primitives/*'],
              message: 'Las primitivas de shadcn/Base UI no se importan desde features/ ni pages/: usá los wrappers de @ui.',
            },
          ],
        },
      ],
    },
  },
]
