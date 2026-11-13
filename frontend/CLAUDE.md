# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 · Vite 6 · Tailwind CSS v4 · TanStack Query v5 · React Router v7  
State: **Zustand** (auth + sidebar + theme stores) · Forms: React Hook Form + Yup  
HTTP: Axios · Icons: Lucide React · Alerts/Toasts: **Sileo**  
Calendar: FullCalendar · Charts: ApexCharts  
UI primitives: **shadcn/ui on Base UI** (`@base-ui/react`, JavaScript, `components.json`) · `cn()` in `src/lib/utils.js` (clsx + tailwind-merge)

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
│   ├── ui/           # Reusable wrappers = the API features use (Button, Dialog, ConfirmDialog,
│   │                 #   Combobox, Select, Table, PageHeader, PageError, etc.)
│   │   └── primitives/  # shadcn/ui vendor code over Base UI (lowercase files). Only @ui wrappers import it
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

## Dialogs and selection lists (shadcn/ui + Base UI)

Features never import `@/components/ui/primitives/*` (ESLint `no-restricted-imports` in `features/` and `pages/`); use the `@ui` wrappers:

- **`@ui/Dialog`** — every dialog. Form mode (`formId`, `submitLabel`, `isLoading`, `submitDisabled`): fixed header + Cancel/Save footer, backdrop click doesn't close. Free mode (no `formId`): `title` → simple header; `bare` + `ariaLabelledBy` → consumer renders everything. Props: `size` (`sm|md|lg|xl|full`), `closeOnBackdrop`, `closeOnEscape`, `showCloseButton`, `ariaLabel`, `className`. Stacking, Escape of the top one, focus trap/return, inert background and scroll lock come from Base UI.
- **Stacking depends on nesting in the React tree**, not on open order: a `Dialog`/`ConfirmDialog`/list stacks on top (narrower, darker backdrop, its own Escape, lists portaled into the top popup) only if it is rendered *inside* the other dialog's content. Sibling dialogs opened at the same time are not stacked. `Dialog` and `ConfirmDialog` both provide `DialogLevelContext` + `DialogPortalContainer` (`@ui/dialogContext`).
- **`@ui/ConfirmDialog`** — confirmations (AlertDialog): `onConfirm`, `title`, `message`, `confirmText`, `cancelText`, `variant`, `isLoading`.
- **`@ui/Combobox`** — searchable list, single or `multiple` (chips). `onSearch` = remote search (debounced, no local filter), `loading`, `clearable`.
- **`@ui/Select`** — short list without search (`options`, `value`, `onChange`, `aria-labelledby`).
- Autocompletes with their own portal (`CustomerSearchInput`) render their list into `useDialogPortalContainer()` (`@ui/dialogContext`) when inside a Dialog.

Adding a shadcn primitive: `npx shadcn@latest add <name>` (goes to `ui/primitives/`), then replace its shadcn classes with design-system tokens (`--color-primary`/`--color-secondary` are MD3, not shadcn's) and wrap it in `@ui`. Check the CLI didn't overwrite `src/index.css` or a same-name `@ui` file (macOS is case-insensitive).

The `shadcn` skill (`.claude/skills/shadcn/`) is a reference for the CLI and Base UI docs only. Where it conflicts with this file, **this file wins**: features use the `@ui` wrappers (never shadcn components directly), the code is JavaScript (its examples are TypeScript), styling uses the MD3 tokens, and every `npx shadcn@latest add` runs with `--dry-run` first.

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

Light/dark design system (`docs/DESIGN_SYSTEM.md`); theme toggled via `useThemeStore` (`.dark` class on `<html>`). Tokens and component patterns live in `.claude/rules/frontend-ui.md` (auto-loaded when editing `.jsx`/`.css`).

Design desktop-first for notebook screens (reference 1440×900); mobile/tablet layouts are not a target and are not QA-tested.  
Always handle `isLoading` and `isError` states when consuming React Query hooks.  
Keep components under 300 lines — extract to sub-components or hooks if larger.

## Testing

Test setup lives in `src/test/`: `setup.js` (global config + jsdom polyfills for Base UI) and `utils.jsx` (exports `renderWithProviders` wrapper with QueryClient + Router). Use `renderWithProviders` instead of plain `render` for components that need those contexts.

```javascript
import { renderWithProviders } from '@/test/utils'
```

Base UI in jsdom: focus moves, closing and scroll lock are async (use `waitFor`); backdrop clicks are detected on `pointerdown`/`mousedown`; `Tab` trapping goes through focus guards (wait a tick after `user.tab()`); lower stacked dialogs are `aria-hidden` (query with `{ hidden: true }`).

CI: Vitest + coverage on push/PR. Deploy target: **Railway**.
