---
name: Frontend Stack Architecture
description: Libraries, state management, and notification patterns used in the frontend after the 2026-03-31 refactor
type: project
---

## State Management: Zustand
Installed and in use. Stores live in `src/stores/`.
- `useAuthStore` — auth state (user, loading, isAuthenticated, login, logout, updateUser). Auto-initializes on store creation.
- `useSidebarStore` — sidebar expand/collapse/mobile state. Resize listener set up in Layout.jsx via useEffect.
- No Context providers needed for these; import directly anywhere.

**Why:** Replaced AuthContext + SidebarContext with Zustand to eliminate provider nesting and allow calling store actions outside of components (e.g., in service files).

## Alerts/Toasts: Sileo
Installed. `<Toaster position="top-right" />` is in App.jsx root.
Notifications are plain functions imported from `notificationService.js`:
```js
import { showCustomerSuccess, showError } from '@services/notificationService';
showCustomerSuccess('CREATED');
```
- No hook, no context, can be called from anywhere.
- Old ToastContext, Toast.jsx, useToast.js — all DELETED.

**Why:** Replaced custom ToastContext system with sileo for better UX (gooey animations, spring physics) and simplified code (no hook/context dependency).

## TanStack Query v5
Already installed before this refactor. Fixed `cacheTime` → `gcTime` (v5 breaking change) in QueryProvider.jsx.
`<Toaster>` from sileo replaced the old react-hot-toast package (which was never used directly).

## New alias: @stores → src/stores
Added to vite.config.js alongside existing aliases.
