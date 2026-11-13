---
paths:
  - "frontend/src/**/*.jsx"
  - "frontend/src/**/*.css"
---

# UI (design system)

Tema claro/oscuro (switch en el header, clase `.dark` en `<html>`, store `useThemeStore`). Los tokens de `src/index.css` cambian solos según el tema: **no uses `dark:` ni colores de paleta (`gray-*`, `zinc-*`, `blue-*`…) para superficies/texto**. Referencia completa de tokens en `docs/DESIGN_SYSTEM.md`. Tailwind v4 con utilidades; nada de CSS custom sin justificación. Fuente: **Geist**.

**Usá tokens semánticos, nunca hex crudo:**

- Fondos: `bg-background`, `bg-surface`, `bg-surface-container` (cards/tablas), `bg-surface-container-high` (hover).
- Texto: `text-on-surface`, `text-on-surface-variant`, `text-secondary` (placeholders).
- Primario (violeta): `text-primary`/`bg-primary`, `bg-primary-container` (CTA), `text-on-primary`.
- Terciario (éxito): `text-tertiary`. Error: `text-error`, `bg-error-container`, `text-on-error-container`.
- Bordes: `border-outline-variant` (sutil), `border-outline` (prominente).

**Patrones:**

- Card: `bg-surface-container border border-outline-variant rounded-lg`
- Botón CTA: `bg-primary-container text-on-primary rounded font-bold hover:brightness-110`
- Botón secundario: `bg-surface-container-high border border-outline-variant text-on-surface rounded`
- Badge activo: `bg-primary-container/20 text-primary` · éxito: `bg-tertiary/10 text-tertiary` · error: `bg-error-container text-on-error-container`
- Input: `bg-surface-variant border border-outline-variant text-on-surface placeholder:text-secondary`

Desktop-first: la app se usa en notebook (referencia 1440×900); diseñá para esa pantalla y no agregues breakpoints para mobile/tablet salvo pedido explícito. Reutilizá los componentes de `@ui` (Button, Dialog, ConfirmDialog, Combobox, Select, DateInput, TimeInput, Switch, Checkbox, Tabs, Table, PageHeader, PageError) antes de crear nuevos.

**Diálogos y listas (shadcn/ui sobre Base UI):** todo diálogo es `@ui/Dialog` (formulario con `formId`, libre, `bare`) o `@ui/ConfirmDialog`; listas con buscador → `@ui/Combobox` (`multiple` para chips), sin buscador → `@ui/Select`. Fechas → `@ui/DateInput` (dd/mm/aaaa + calendario, valor ISO), horas → `@ui/TimeInput`, interruptores → `@ui/Switch`, casillas → `@ui/Checkbox`, pestañas → `@ui/Tabs` (ESLint rechaza `<select>` e `<input type="date|time|checkbox">` en `features/`, `pages/` y `layout/`). **No importes `@/components/ui/primitives/*` desde `features/` ni `pages/`** (ESLint lo bloquea): las primitivas solo las usan los wrappers de `@ui`. No armes diálogos con `createPortal` ni manejes Escape/foco/scroll a mano.
