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
  {
    // Controles nativos o hechos a mano → wrappers de @ui (fase 2 de shadcn/Base UI)
    files: ['src/components/features/**/*.{js,jsx}', 'src/pages/**/*.{js,jsx}', 'src/layout/**/*.{js,jsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: 'No uses <select> nativo: usá @ui/Select (o @ui/Combobox si necesita búsqueda).',
        },
        {
          selector: "JSXOpeningElement[name.name='input'] > JSXAttribute[name.name='type'][value.value='date']",
          message: 'No uses <input type="date">: usá @ui/DateInput (dd/mm/aaaa + calendario, valor ISO).',
        },
        {
          selector: "JSXOpeningElement[name.name='input'] > JSXAttribute[name.name='type'][value.value='time']",
          message: 'No uses <input type="time">: usá @ui/TimeInput (hh:mm).',
        },
        {
          selector: "JSXOpeningElement[name.name='input'] > JSXAttribute[name.name='type'][value.value='checkbox']",
          message: 'No uses <input type="checkbox">: usá @ui/Checkbox (con indeterminate).',
        },
      ],
    },
  },
]
