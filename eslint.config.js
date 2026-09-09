/**
 * Configuração do ESLint — formato plano (ESLint 9).
 *
 * Existe por causa da auditoria de 08/09/2026: o script de lint imprimia um
 * aviso e saía com sucesso, e sem ele duas regras não tinham verificação
 * nenhuma no front — código morto (COD-08) e dependência de efeito (FE-06).
 *
 * O conjunto é deliberadamente pequeno. Regra de estilo não entra: o projeto
 * não usa formatador automático, e ligar dezenas de regras cosméticas afogaria
 * os achados que importam num relatório que ninguém leria até o fim.
 */
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'e2e/node_modules/**',
      'coverage/**',
      // Código de terceiro, mantido intocado de propósito: é a fonte do efeito
      // de fios da landing. Lintá-lo produziria achados que ninguém vai
      // corrigir, porque corrigir significaria divergir do original.
      'src/components/landing/WebThreads.jsx',
    ],
  },

  // Aplicação
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      // O projeto usa a transformação nova de JSX: React não precisa estar no
      // escopo, e exigir o import seria reprovar o padrão correto.
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs['recommended-latest'].rules,

      // Cobre COD-08. Argumento não usado passa quando começa com `_`, que é a
      // forma de dizer "recebo e ignoro de propósito" sem apagar a assinatura.
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],

      // `prop-types` não se aplica: o projeto não declara tipos de prop, por
      // decisão — não há TypeScript nem biblioteca de validação em runtime.
      'react/prop-types': 'off',
    },
  },

  // Testes de ponta a ponta: rodam em Node, com os globais do Playwright.
  {
    files: ['e2e/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },

  // Configuração de ferramenta: roda em Node.
  {
    files: ['*.config.js', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
    rules: { ...js.configs.recommended.rules },
  },
]
