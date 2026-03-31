# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 · Vite 6 · Tailwind CSS v4 · React Query v5 (TanStack) · React Router v7  
Forms: React Hook Form + Yup · HTTP: Axios · Icons: Lucide React · Toasts: react-hot-toast  
Calendar: FullCalendar · Charts: ApexCharts

## Commands

```bash
npm run dev          # Dev server on :5173
npm run build        # Production build
npm test             # Vitest (watch mode)
npm run test:coverage
npm run lint
npm run lint:fix
```

## Import Aliases — Always use these, never relative paths

```javascript
@          → src/
@ui        → src/components/ui
@common    → src/components/common
@components → src/components
@layout    → src/layout
@pages     → src/pages
@hooks     → src/hooks
@services  → src/services
@contexts  → src/contexts
@utils     → src/utils
@icons     → src/icons
@assets    → src/assets
```

## Architecture

**Component pattern**: Container (logic/state) + View (render only).  
**Server state**: All API calls go through React Query — never use `fetch` or raw axios directly in components.  
**Global state**: Only auth context. No Redux/Zustand.

```
src/
├── components/
│   ├── ui/           # Reusable primitives (Button, Modal, Table, etc.)
│   ├── common/       # Shared layout pieces
│   └── features/     # Domain components: customers/, vehicles/, appointments/,
│                     #   services/, products/, service-records/
├── pages/            # Route-level containers
├── hooks/            # Custom hooks (data fetching wrappers, etc.)
├── services/         # Axios API clients (one file per domain)
│   └── api.js        # Axios instance with base config + interceptors
├── contexts/         # Auth context only
└── utils/
```

## API Services

Each domain has its own service file in `src/services/` (e.g., `customersService.js`, `productsService.js`). Services export React Query hooks and plain async functions. The base Axios instance is in `services/api.js`.

## UI Guidelines

**Design system:** Dark-only. See `docs/DESIGN_SYSTEM.md` for full token reference.  
Tailwind CSS v4 — prefer utility classes over custom CSS. Font: **Geist**.

**Semantic color tokens (use these, not raw hex):**
```
Fondos:
  bg-background          #09090b   → fondo general
  bg-surface             #0c0c0f   → sidebar, base de cards
  bg-surface-container   #121215   → cards, tablas
  bg-surface-container-high #18181b → hover, header activo

Texto:
  text-on-surface        #fafafa   → texto principal
  text-secondary         #71717a   → texto secundario, placeholders
  text-on-surface-variant #a1a1aa  → texto levemente secundario

Primario (violeta):
  text-primary / bg-primary         #a78bfa  → accent, activo, íconos
  bg-primary-container              #7c3aed  → botones CTA, logo bg
  text-on-primary                   #0a0012  → texto sobre primary-container

Terciario (verde):
  text-tertiary          #34d399   → tendencias positivas, éxito

Bordes:
  border-outline-variant #27272a   → bordes sutiles (cards, dividers)
  border-outline         #52525b   → bordes prominentes

Error:
  text-error / bg-error             #ef4444
  bg-error-container                #3b1111
  text-on-error-container           #fca5a5

Estados semánticos:
  --color-success-500    #12b76a
  --color-warning-500    #f79009
```

**Patrones de componentes:**
- Card: `bg-surface-container border border-outline-variant rounded-lg`
- Botón CTA: `bg-primary-container text-on-primary rounded font-bold hover:brightness-110`
- Botón secondary: `bg-surface-container-high border border-outline-variant text-on-surface rounded`
- Badge activo: `bg-primary-container/20 text-primary`
- Badge éxito: `bg-tertiary-container text-on-tertiary-container`
- Badge error: `bg-error-container text-on-error-container`
- Input: `bg-surface-variant border border-outline-variant text-on-surface placeholder:text-secondary`

Always design mobile-first and scale up with Tailwind breakpoints.  
Always handle `isLoading` and `isError` states when consuming React Query hooks.  
Keep components under 300 lines — extract to sub-components or hooks if larger.

## Testing

Test setup lives in `src/test/`: `setup.js` (global config) and `utils.jsx` (exports `renderWithProviders` wrapper with QueryClient + Router). Use `renderWithProviders` instead of plain `render` for components that need those contexts.

```javascript
import { renderWithProviders } from '@/test/utils'
```

CI: Vitest + coverage on push/PR. Deploy target: **Vercel**.
