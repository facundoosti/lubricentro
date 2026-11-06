---
paths:
  - "frontend/src/**/__tests__/**"
  - "frontend/src/**/*.test.{js,jsx}"
---

# Tests frontend (Vitest + Testing Library)

- Ubicación: `__tests__/` junto al código (`src/hooks/__tests__/useCrudPage.test.js`).
- Usá `renderWithProviders` de `@/test/utils` (QueryClient + Router) en vez de `render` plano.
- Testeá comportamiento visible (roles, textos, interacciones con `userEvent`), no detalles de implementación.
- Mockeá los servicios de `@services/*`; nunca peguen al backend real.
- Cubrí los estados `isLoading`, `isError` y vacío de cada componente que consume React Query.
- Correr: `cd frontend && npx vitest run <archivo>`.
