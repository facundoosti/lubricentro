## Why

La fase 1 dejó la base shadcn/ui sobre Base UI y unificó diálogos y listas, pero siguen controles nativos o hechos a mano que se ven y se comportan distinto según el navegador: 13 `<select>` nativos (la lista desplegada no respeta el tema oscuro ni el diseño), 8 `type="date"` y 2 `type="time"` (formato que depende del SO, picker nativo con `showPicker()` que a veces falla y no se puede tipear cómodo en dd/mm/aaaa) y Switch/Checkbox/Tabs armados a mano con `role` y `aria-*` manuales. Completar la migración deja **una sola forma** de hacer cada control, con teclado y accesibilidad de Base UI, **sin cambiar el diseño visual**.

Esta es la **fase 2** de 2 (la fase 1 es `2026-11-13-shadcn-base-ui-fase-1`).

## What Changes

- **`<select>` nativos → `@ui/Select`** en los 13 usos (formularios de producto, vehículo, atención, turno, presupuesto, IVA, filtros de productos y recordatorios, `BulkPriceModal`). Los que usan `register` de react-hook-form pasan a `Controller`. `IvaRateSelect`, `ProductIvaField` y `BudgetStatusSelect` se mantienen como componentes de dominio, pero adentro usan `@ui/Select`.
- **Nuevo `DateInput`** (`@ui/DateInput`): input **tipeable con máscara `dd/mm/aaaa`** + botón con ícono de calendario que abre un **Calendar en un Popover** (Base UI). Valor externo en ISO `yyyy-MM-dd` (igual que hoy `type="date"`), así formularios, API y tests de servicios no cambian. Reemplaza los 8 `type="date"`. Se elimina `openPicker`/`showPicker()` de `AppointmentForm`.
- **Nuevo `TimeInput`** (`@ui/TimeInput`): input tipeable con máscara `hh:mm` (24 h), valor `HH:mm`. Reemplaza los 2 `type="time"` de Configuración (horarios de atención). Sin popover.
- **Nuevo `Switch`** (`@ui/Switch`) sobre Base UI: reemplaza el toggle de tema del `Header` y el de día abierto/cerrado en Configuración, manteniendo sus dos estilos actuales (variantes).
- **Nuevo `Checkbox`** (`@ui/Checkbox`) sobre Base UI, con estado **indeterminado**: reemplaza los checkboxes de selección de `ProductsTable` (el de la cabecera hoy fuerza `indeterminate` por `ref`).
- **Nuevo `Tabs`** (`@ui/Tabs`) sobre Base UI: reemplaza el `tablist` manual de `CustomerHistoryCard` (suma navegación con flechas y vínculo tab ↔ panel).
- Nuevas primitivas shadcn en `ui/primitives/` (`popover`, `calendar`, `switch`, `checkbox`, `tabs`), siempre agregadas con `npx shadcn add --dry-run` primero.
- Regla de lint: `no-restricted-syntax` que prohíbe `<select>` y `<input type="date|time|checkbox">` en `features/` y `pages/`.
- Documentar los nuevos wrappers en `frontend/CLAUDE.md` › Dialogs and selection lists.

## Capabilities

### New Capabilities
- `campos-fecha-hora`: carga de fechas (tipeo dd/mm/aaaa + calendario) y horas (hh:mm): formato, validación, valor ISO, teclado, Escape dentro de diálogos, accesibilidad.
- `controles-ui`: Switch, Checkbox (con indeterminado) y Tabs comunes: estados, teclado y accesibilidad.

### Modified Capabilities
- `listas-seleccion`: el `Select` de `@ui` SHALL usarse para **todas** las listas cortas sin búsqueda (no solo hora y estado del turno); no quedan `<select>` nativos en la app.

## Impact

- **Apps**: solo **frontend**. Sin backend, **sin migraciones**, sin cambios de API (las fechas siguen viajando como `yyyy-MM-dd` y las horas como `HH:mm`).
- **Dependencias nuevas**: `react-day-picker` (lo usa el Calendar de shadcn; `date-fns` ya está).
- **Archivos**: `src/components/ui/` (nuevos `DateInput`, `TimeInput`, `Switch`, `Checkbox`, `Tabs` + primitivas), ~14 consumidores en `features/`, `pages/` y `layout/Header.jsx`, sus tests, `eslint.config.js` y `frontend/CLAUDE.md`.
- **Riesgo**: los selects con `register` (no controlados) pasan a `Controller`: hay que mantener valores por defecto, `reset()` y validaciones. Los filtros de fechas de Recordatorios y de atenciones tienen que seguir aplicando el mismo rango.

## Fuera de alcance

- Migrar `CustomerSearchInput` / `ProductSearchInput` a Autocomplete de Base UI: funcionan bien desde la fase 1 (portal en el diálogo), `CustomerSearchInput` tiene ~300 líneas con alta rápida de cliente y el riesgo no se justifica en este change. Queda como candidato para un change propio.
- Selector de rango de fechas en un solo calendario (Recordatorios sigue con "desde" y "hasta" separados).
- Popover/lista de horas para `TimeInput` (solo tipeo con máscara).
- `Table`, `Pagination`, `Button`, `Badge`, `InputField`, `TextArea`, toasts, ApexCharts, FullCalendar.
- Cualquier cambio de diseño visual (colores, tamaños, tipografía) más allá de que la lista del Select y el calendario respeten el tema.
