# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 · Vite 6 · Tailwind CSS v4 · TanStack Query v5 · React Router v7  
State: **Zustand** (auth + sidebar stores) · Forms: React Hook Form + Yup  
HTTP: Axios · Icons: Lucide React · Alerts/Toasts: **Sileo**  
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
@stores    → src/stores
@contexts  → src/contexts
@utils     → src/utils
@icons     → src/icons
@assets    → src/assets
```

## Architecture

**Component pattern**: Container (logic/state) + View (render only).  
**Server state**: All API calls go through TanStack Query — never use `fetch` or raw axios directly in components.  
**Global state**: Zustand stores (`useAuthStore`, `useSidebarStore`) — no Context for state. Context only for QueryProvider.  
**Notifications**: Import plain functions from `notificationService.js` — never use a hook or Context for toasts.

```
src/
├── components/
│   ├── ui/           # Reusable primitives (Button, Modal, Table, PageHeader, PageError, etc.)
│   ├── common/       # Shared layout pieces
│   └── features/     # Domain components: customers/, vehicles/, appointments/,
│                     #   services/, products/, service-records/
├── pages/            # Route-level containers
├── hooks/            # Custom hooks: useCrudPage (pagination/modal state), useModalError
├── stores/           # Zustand stores: useAuthStore, useSidebarStore
├── services/         # Axios API clients (one file per domain)
│   ├── api.js        # Axios instance with base config + interceptors
│   └── notificationService.js  # Plain functions wrapping sileo (showSuccess, showError, etc.)
├── contexts/         # QueryProvider only (React Query)
└── utils/
```

## API Services

Each domain has its own service file in `src/services/` (e.g., `customersService.js`, `productsService.js`). Services export TanStack Query hooks and plain async functions. The base Axios instance is in `services/api.js`.

**Notifications** — import from `notificationService.js` directly, no hook needed:
```javascript
import { showCustomerSuccess, showError } from '@services/notificationService';
showCustomerSuccess('CREATED');
```

**Stores** — import directly, no Provider wrapping needed:
```javascript
import { useAuthStore } from '@stores/useAuthStore';
const { user, login, logout } = useAuthStore();
```

## UI Guidelines

Dark-only design system (`docs/DESIGN_SYSTEM.md`). Tokens and component patterns live in `.claude/rules/frontend-ui.md` (auto-loaded when editing `.jsx`/`.css`).

Always design mobile-first and scale up with Tailwind breakpoints.  
Always handle `isLoading` and `isError` states when consuming React Query hooks.  
Keep components under 300 lines — extract to sub-components or hooks if larger.

## Testing

Test setup lives in `src/test/`: `setup.js` (global config) and `utils.jsx` (exports `renderWithProviders` wrapper with QueryClient + Router). Use `renderWithProviders` instead of plain `render` for components that need those contexts.

```javascript
import { renderWithProviders } from '@/test/utils'
```

CI: Vitest + coverage on push/PR. Deploy target: **Railway**.
